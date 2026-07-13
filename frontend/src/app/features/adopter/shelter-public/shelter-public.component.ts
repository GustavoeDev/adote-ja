import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PublicShelter } from '../../../core/models/adopter.model';
import { AdopterApiService } from '../../../core/services/adopter-api.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { breedSexLine } from '../../../shared/utils/animal-display';

@Component({
  selector: 'app-shelter-public',
  standalone: true,
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    StatusBadgeComponent,
  ],
  templateUrl: './shelter-public.component.html',
  styleUrl: './shelter-public.component.scss',
})
export class ShelterPublicComponent implements OnInit {
  private readonly api = inject(AdopterApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly shelter = signal<PublicShelter | null>(null);
  readonly breedSexLine = breedSexLine;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      void this.router.navigate(['/adotante/inicio']);
      return;
    }
    this.api.getShelter(id).subscribe({
      next: (shelter) => {
        this.shelter.set(shelter);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Abrigo não encontrado.', 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
        void this.router.navigate(['/adotante/inicio']);
      },
    });
  }

  goBack(): void {
    void this.router.navigate(['/adotante/inicio']);
  }
}
