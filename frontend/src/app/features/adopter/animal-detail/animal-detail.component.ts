import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DiscoverAnimalDetail } from '../../../core/models/adopter.model';
import { AdopterApiService } from '../../../core/services/adopter-api.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { breedLabel } from '../../../shared/utils/animal-display';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    StatusBadgeComponent,
  ],
  templateUrl: './animal-detail.component.html',
  styleUrl: './animal-detail.component.scss',
})
export class AnimalDetailComponent implements OnInit {
  private readonly api = inject(AdopterApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly animal = signal<DiscoverAnimalDetail | null>(null);
  readonly photoIdx = signal(0);
  readonly breedLabel = breedLabel;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      void this.router.navigate(['/adotante/inicio']);
      return;
    }
    this.api.getAnimal(id).subscribe({
      next: (animal) => {
        this.animal.set(animal);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Animal não encontrado.', 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
        void this.router.navigate(['/adotante/inicio']);
      },
    });
  }

  photos(): string[] {
    const a = this.animal();
    if (!a) return [];
    const urls = a.media
      .filter((m) => m.media_type === 'photo' && m.file_url)
      .sort((x, y) => Number(y.is_cover) - Number(x.is_cover) || x.order - y.order)
      .map((m) => m.file_url);
    if (urls.length) return urls;
    return a.cover_photo_url ? [a.cover_photo_url] : [];
  }

  prevPhoto(): void {
    const n = this.photos().length;
    if (!n) return;
    this.photoIdx.update((i) => (i - 1 + n) % n);
  }

  nextPhoto(): void {
    const n = this.photos().length;
    if (!n) return;
    this.photoIdx.update((i) => (i + 1) % n);
  }

  sizeLabel(size: string): string {
    const map: Record<string, string> = { small: 'Pequeno', medium: 'Médio', large: 'Grande' };
    return map[size] || '—';
  }

  canAdopt(): boolean {
    const a = this.animal();
    return !!a && a.status === 'available' && !a.has_active_request;
  }

  adoptCtaLabel(): string {
    const a = this.animal();
    if (!a) return 'Quero Adotar';
    if (a.has_active_request) return 'Solicitação já enviada';
    if (a.status !== 'available') return 'Indisponível';
    return 'Quero Adotar';
  }

  goAdopt(): void {
    const a = this.animal();
    if (!a || !this.canAdopt()) return;
    void this.router.navigate(['/adotante/animais', a.id, 'adotar']);
  }

  goBack(): void {
    void this.router.navigate(['/adotante/inicio']);
  }
}
