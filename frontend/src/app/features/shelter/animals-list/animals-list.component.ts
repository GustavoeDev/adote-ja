import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { Animal, AnimalSpecies } from '../../../core/models/animal.model';
import { ShelterApiService } from '../../../core/services/shelter-api.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { breedLabel } from '../../../shared/utils/animal-display';
import { ConfirmInactivateDialogComponent } from '../dashboard/confirm-inactivate-dialog.component';

type ActivityFilter = 'active' | 'inactive';
type SpeciesFilter = 'all' | AnimalSpecies;

@Component({
  selector: 'app-animals-list',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    StatusBadgeComponent,
  ],
  templateUrl: './animals-list.component.html',
  styleUrl: './animals-list.component.scss',
})
export class AnimalsListComponent implements OnInit {
  private readonly api = inject(ShelterApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly animals = signal<Animal[]>([]);
  readonly activityFilter = signal<ActivityFilter>('active');
  readonly filter = signal<SpeciesFilter>('all');
  readonly openMenuId = signal<number | null>(null);
  readonly breedLabel = breedLabel;

  readonly activityFilters: { id: ActivityFilter; label: string }[] = [
    { id: 'active', label: 'Ativos' },
    { id: 'inactive', label: 'Inativos' },
  ];

  readonly filters: { id: SpeciesFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'Todos', icon: 'all_inclusive' },
    { id: 'dog', label: 'Cães', icon: 'pet_supplies' },
    { id: 'cat', label: 'Gatos', icon: 'pets' },
    { id: 'other', label: 'Outros', icon: 'spa' },
  ];

  readonly filteredAnimals = computed(() => {
    const current = this.filter();
    const list = this.animals();
    if (current === 'all') return list;
    return list.filter((a) => a.species === current);
  });

  readonly counts = computed(() => {
    const list = this.animals();
    return {
      all: list.length,
      dog: list.filter((a) => a.species === 'dog').length,
      cat: list.filter((a) => a.species === 'cat').length,
      other: list.filter((a) => a.species === 'other').length,
    };
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const isActive = this.activityFilter() === 'active';
    this.api.listAnimals({ isActive }).subscribe({
      next: (animals) => {
        this.animals.set(animals);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar os animais.', 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  setActivityFilter(value: ActivityFilter): void {
    if (this.activityFilter() === value) return;
    this.activityFilter.set(value);
    this.filter.set('all');
    this.closeMenu();
    this.load();
  }

  setFilter(value: SpeciesFilter): void {
    this.filter.set(value);
    this.closeMenu();
  }

  countFor(id: SpeciesFilter): number {
    return this.counts()[id];
  }

  toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  editAnimal(animal: Animal): void {
    this.closeMenu();
    void this.router.navigate(['/abrigo/animais', animal.id, 'editar']);
  }

  confirmInactivate(animal: Animal): void {
    this.closeMenu();
    const ref = this.dialog.open(ConfirmInactivateDialogComponent, {
      width: 'min(100% - 2rem, 400px)',
      data: { name: animal.name, action: 'inactivate' as const },
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

  confirmActivate(animal: Animal): void {
    this.closeMenu();
    const ref = this.dialog.open(ConfirmInactivateDialogComponent, {
      width: 'min(100% - 2rem, 400px)',
      data: { name: animal.name, action: 'activate' as const },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.activateAnimal(animal.id).subscribe({
        next: () => {
          this.snackBar.open('Animal reativado.', 'Fechar', {
            duration: 3000,
            panelClass: 'snackbar-success',
          });
          this.load();
        },
        error: () => {
          this.snackBar.open('Erro ao reativar animal.', 'Fechar', {
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
}
