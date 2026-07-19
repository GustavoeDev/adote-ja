import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { DiscoverAnimal } from '../../../core/models/adopter.model';
import { AdopterApiService } from '../../../core/services/adopter-api.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { breedSexLine } from '../../../shared/utils/animal-display';

type FilterId = 'all' | 'dog' | 'cat' | 'other';

@Component({
  selector: 'app-adopter-home',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    StatusBadgeComponent,
  ],
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
  readonly activeCity = signal('');
  readonly breedSexLine = breedSexLine;

  readonly filters: { id: FilterId; label: string; icon: string }[] = [
    { id: 'all', label: 'Todos', icon: 'all_inclusive' },
    { id: 'dog', label: 'Cães', icon: 'pet_supplies' },
    { id: 'cat', label: 'Gatos', icon: 'pets' },
    { id: 'other', label: 'Outros', icon: 'spa' },
  ];

  readonly cities = computed(() => {
    const values = new Set<string>();
    for (const animal of this.animals()) {
      const city = (animal.city || '').trim();
      if (city) values.add(city);
    }
    return [...values].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  });

  readonly cityLabel = computed(() => this.activeCity() || 'Cidade');

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const filter = this.activeFilter();
    const city = this.activeCity();
    return this.animals().filter((a) => {
      const matchFilter = filter === 'all' || a.species === filter;
      const matchCity = !city || (a.city || '').trim() === city;
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        (a.breed || '').toLowerCase().includes(q);
      return matchFilter && matchCity && matchSearch;
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

  setCity(city: string): void {
    this.activeCity.set(city);
  }

  openAnimal(id: number): void {
    void this.router.navigate(['/adotante/animais', id]);
  }
}
