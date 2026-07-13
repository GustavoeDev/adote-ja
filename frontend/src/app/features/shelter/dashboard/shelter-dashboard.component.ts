import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { Animal, ShelterDashboard } from '../../../core/models/animal.model';
import { ShelterApiService } from '../../../core/services/shelter-api.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { breedLabel } from '../../../shared/utils/animal-display';
import { ConfirmInactivateDialogComponent } from './confirm-inactivate-dialog.component';

const DASHBOARD_ANIMALS_PREVIEW = 5;

@Component({
  selector: 'app-shelter-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    StatusBadgeComponent,
    RouterLink,
  ],
  templateUrl: './shelter-dashboard.component.html',
  styleUrl: './shelter-dashboard.component.scss',
})
export class ShelterDashboardComponent implements OnInit {
  private readonly api = inject(ShelterApiService);
  readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly breedLabel = breedLabel;
  readonly dashboard = signal<ShelterDashboard | null>(null);
  readonly animals = signal<Animal[]>([]);
  readonly openMenuId = signal<number | null>(null);

  readonly previewAnimals = computed(() => this.animals().slice(0, DASHBOARD_ANIMALS_PREVIEW));
  readonly hasMoreAnimals = computed(() => this.animals().length > DASHBOARD_ANIMALS_PREVIEW);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    forkJoin({
      dashboard: this.api.getDashboard(),
      animals: this.api.listAnimals(),
    }).subscribe({
      next: ({ dashboard, animals }) => {
        this.dashboard.set(dashboard);
        this.animals.set(animals);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar o dashboard.', 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  confirmInactivate(animal: Animal): void {
    this.closeMenu();
    const ref = this.dialog.open(ConfirmInactivateDialogComponent, {
      width: 'min(100% - 2rem, 400px)',
      data: { name: animal.name },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.inactivateAnimal(animal.id).subscribe({
        next: () => {
          this.snackBar.open('Animal inativado.', 'Fechar', {
            duration: 3000,
            panelClass: 'snackbar-success',
          });
          this.load();
        },
        error: () => {
          this.snackBar.open('Erro ao inativar animal.', 'Fechar', {
            duration: 4000,
            panelClass: 'snackbar-error',
          });
        },
      });
    });
  }

  onFabClick(): void {
    void this.router.navigate(['/abrigo/animais/novo']);
  }

  editAnimal(animal: Animal): void {
    this.closeMenu();
    void this.router.navigate(['/abrigo/animais', animal.id, 'editar']);
  }

  logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigate(['/login']));
  }
}
