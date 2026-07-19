import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AdoptionRequest, AdoptionRequestStatus } from '../../../core/models/adoption.model';
import { AdopterApiService } from '../../../core/services/adopter-api.service';

@Component({
  selector: 'app-adopter-requests',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './adopter-requests.component.html',
  styleUrl: './adopter-requests.component.scss',
})
export class AdopterRequestsComponent implements OnInit {
  private readonly api = inject(AdopterApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly requests = signal<AdoptionRequest[]>([]);
  readonly expandedId = signal<number | null>(null);

  ngOnInit(): void {
    this.api.listRequests().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar suas solicitações.', 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  toggle(id: number): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  statusLabel(status: AdoptionRequestStatus): string {
    const map: Record<AdoptionRequestStatus, string> = {
      pending: 'Pendente',
      in_progress: 'Em andamento',
      approved: 'Aprovado',
      rejected: 'Recusado',
    };
    return map[status];
  }
}
