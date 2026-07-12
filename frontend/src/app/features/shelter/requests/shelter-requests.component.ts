import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  AdoptionRequest,
  AdoptionRequestStatus,
} from '../../../core/models/adoption.model';
import { ShelterApiService } from '../../../core/services/shelter-api.service';

type RequestFilter = 'all' | AdoptionRequestStatus;

@Component({
  selector: 'app-shelter-requests',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './shelter-requests.component.html',
  styleUrl: './shelter-requests.component.scss',
})
export class ShelterRequestsComponent implements OnInit {
  private readonly api = inject(ShelterApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly requests = signal<AdoptionRequest[]>([]);
  readonly filter = signal<RequestFilter>('all');
  readonly selected = signal<AdoptionRequest | null>(null);

  readonly filters: { id: RequestFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Pendentes' },
    { id: 'approved', label: 'Aprovados' },
    { id: 'rejected', label: 'Recusados' },
  ];

  readonly filteredRequests = computed(() => {
    const current = this.filter();
    const list = this.requests();
    if (current === 'all') return list;
    return list.filter((r) => r.status === current);
  });

  readonly counts = computed(() => {
    const list = this.requests();
    return {
      all: list.length,
      pending: list.filter((r) => r.status === 'pending').length,
      approved: list.filter((r) => r.status === 'approved').length,
      rejected: list.filter((r) => r.status === 'rejected').length,
    };
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.listRequests().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
        const selected = this.selected();
        if (selected) {
          const updated = requests.find((r) => r.id === selected.id) ?? null;
          this.selected.set(updated);
        }
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar as solicitações.', 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  setFilter(id: RequestFilter): void {
    this.filter.set(id);
  }

  openDetail(request: AdoptionRequest): void {
    this.selected.set(request);
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  statusLabel(status: AdoptionRequestStatus): string {
    const map: Record<AdoptionRequestStatus, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Recusado',
    };
    return map[status];
  }

  approve(): void {
    const request = this.selected();
    if (!request || this.acting()) return;
    this.acting.set(true);
    this.api.approveRequest(request.id).subscribe({
      next: (updated) => {
        this.acting.set(false);
        this.patchRequest(updated);
        this.selected.set(updated);
        this.snackBar.open('Pedido aprovado!', 'Fechar', { duration: 3000 });
      },
      error: () => {
        this.acting.set(false);
        this.snackBar.open('Não foi possível aprovar o pedido.', 'Fechar', { duration: 4000 });
      },
    });
  }

  reject(): void {
    const request = this.selected();
    if (!request || this.acting()) return;
    this.acting.set(true);
    this.api.rejectRequest(request.id).subscribe({
      next: (updated) => {
        this.acting.set(false);
        this.patchRequest(updated);
        this.selected.set(updated);
        this.snackBar.open('Pedido recusado.', 'Fechar', { duration: 3000 });
      },
      error: () => {
        this.acting.set(false);
        this.snackBar.open('Não foi possível recusar o pedido.', 'Fechar', { duration: 4000 });
      },
    });
  }

  private patchRequest(updated: AdoptionRequest): void {
    this.requests.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }
}
