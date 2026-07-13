import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { DiscoverAnimal } from '../../../core/models/adopter.model';
import { AdopterApiService } from '../../../core/services/adopter-api.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { breedSexLine } from '../../../shared/utils/animal-display';

type FilterId = 'all' | 'dog' | 'cat' | 'rabbit';

@Component({
  selector: 'app-adopter-home',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, StatusBadgeComponent],
  templateUrl: './adopter-home.component.html',
  styleUrl: './adopter-home.component.scss',
})
export class AdopterHomeComponent implements OnInit {
  private readonly api = inject(AdopterApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly animals = signal<DiscoverAnimal[]>([]);
  readonly search = signal('');
  readonly activeFilter = signal<FilterId>('all');
  readonly breedSexLine = breedSexLine;

  readonly filters: { id: FilterId; label: string; icon: string }[] = [
    { id: 'all', label: 'Todos', icon: 'pets' },
    { id: 'dog', label: 'Cães', icon: 'cruelty_free' },
    { id: 'cat', label: 'Gatos', icon: 'emoji_nature' },
    { id: 'rabbit', label: 'Coelhos', icon: 'cruelty_free' },
  ];

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const filter = this.activeFilter();
    return this.animals().filter((a) => {
      const matchFilter = filter === 'all' || a.species === filter;
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        (a.breed || '').toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.listAnimals().subscribe({
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

  setFilter(id: FilterId): void {
    this.activeFilter.set(id);
  }

  openAnimal(id: number): void {
    void this.router.navigate(['/adotante/animais', id]);
  }
}
