import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  AdoptionRequest,
  AdoptionRequestStatus,
} from '../../../core/models/adoption.model';
import { ShelterApiService } from '../../../core/services/shelter-api.service';
import { RejectRequestDialogComponent } from './reject-request-dialog.component';
import {
  ReviewRequestDataDialogComponent,
  ReviewDataDialogResult,
} from './review-request-data-dialog.component';

type RequestFilter = 'all' | AdoptionRequestStatus;

@Component({
  selector: 'app-shelter-requests',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './shelter-requests.component.html',
  styleUrl: './shelter-requests.component.scss',
})
export class ShelterRequestsComponent implements OnInit {
  private readonly api = inject(ShelterApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly requests = signal<AdoptionRequest[]>([]);
  readonly filter = signal<RequestFilter>('all');
  readonly selected = signal<AdoptionRequest | null>(null);

  readonly filters: { id: RequestFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Pendentes' },
    { id: 'in_progress', label: 'Em andamento' },
    { id: 'approved', label: 'Aprovados' },
    { id: 'rejected', label: 'Recusados' },
  ];

  private readonly statusOrder: Record<AdoptionRequestStatus, number> = {
    pending: 0,
    in_progress: 1,
    approved: 2,
    rejected: 3,
  };

  readonly filteredRequests = computed(() => {
    const current = this.filter();
    const list = this.requests();
    if (current === 'all') {
      return [...list].sort(
        (a, b) => this.statusOrder[a.status] - this.statusOrder[b.status],
      );
    }
    return list.filter((r) => r.status === current);
  });

  readonly counts = computed(() => {
    const list = this.requests();
    return {
      all: list.length,
      pending: list.filter((r) => r.status === 'pending').length,
      in_progress: list.filter((r) => r.status === 'in_progress').length,
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
      in_progress: 'Em andamento',
      approved: 'Aprovado',
      rejected: 'Recusado',
    };
    return map[status];
  }

  openWhatsApp(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  openDataReview(): void {
    const request = this.selected();
    if (!request || !request.can_review_data || this.acting()) return;

    const ref = this.dialog.open(ReviewRequestDataDialogComponent, {
      width: '34rem',
      maxWidth: '95vw',
      data: request,
    });

    ref.afterClosed().subscribe((result?: ReviewDataDialogResult) => {
      if (result === 'approve') {
        this.runAction(
          this.api.approveRequestData(request.id),
          'Cadastro aprovado. Agora você pode agendar a entrevista.',
          'Não foi possível aprovar o cadastro.',
        );
        return;
      }
      if (result === 'reject') {
        const rejectRef = this.dialog.open(RejectRequestDialogComponent, {
          width: '26rem',
          maxWidth: '95vw',
          data: {
            adopterName: request.adopter_name,
            animalName: request.animal_name,
            title: 'Recusar cadastro',
            lead: `Informe o motivo da recusa do cadastro de ${request.adopter_name}. O pedido de adoção será encerrado.`,
          },
        });
        rejectRef.afterClosed().subscribe((reason?: string) => {
          if (!reason) return;
          this.runAction(
            this.api.rejectRequestData(request.id, reason),
            'Cadastro recusado. Pedido encerrado.',
            'Não foi possível recusar o cadastro.',
          );
        });
      }
    });
  }

  scheduleInterview(): void {
    const request = this.selected();
    if (!request || this.acting()) return;
    this.acting.set(true);
    this.api.scheduleInterview(request.id).subscribe({
      next: (updated) => {
        this.acting.set(false);
        this.patchRequest(updated);
        this.selected.set(updated);
        this.snackBar.open('Entrevista agendada!', 'Fechar', { duration: 2500 });
        // Após o verde "Entrevista agendada", avança para amarelo "Realizar entrevista".
        window.setTimeout(() => this.startInterview(updated.id), 1100);
      },
      error: (err) => {
        this.acting.set(false);
        this.showError(err, 'Não foi possível confirmar o agendamento.');
      },
    });
  }

  startInterview(id?: number): void {
    const requestId = id ?? this.selected()?.id;
    if (!requestId || this.acting()) return;
    this.acting.set(true);
    this.api.startInterview(requestId).subscribe({
      next: (updated) => {
        this.acting.set(false);
        this.patchRequest(updated);
        this.selected.set(updated);
      },
      error: (err) => {
        this.acting.set(false);
        this.showError(err, 'Não foi possível avançar para a realização da entrevista.');
      },
    });
  }

  completeInterview(): void {
    const request = this.selected();
    if (!request || this.acting()) return;
    this.runAction(
      this.api.completeInterview(request.id),
      'Entrevista marcada como realizada.',
      'Não foi possível atualizar a entrevista.',
    );
  }

  approve(): void {
    const request = this.selected();
    if (!request || this.acting()) return;
    this.runAction(
      this.api.approveRequest(request.id),
      'Pedido aprovado!',
      'Não foi possível aprovar o pedido.',
    );
  }

  reject(): void {
    const request = this.selected();
    if (!request || this.acting()) return;

    const ref = this.dialog.open(RejectRequestDialogComponent, {
      width: '26rem',
      maxWidth: '95vw',
      data: {
        adopterName: request.adopter_name,
        animalName: request.animal_name,
      },
    });

    ref.afterClosed().subscribe((reason?: string) => {
      if (!reason) return;
      this.runAction(
        this.api.rejectRequest(request.id, reason),
        'Pedido recusado.',
        'Não foi possível recusar o pedido.',
      );
    });
  }

  private runAction(
    request$: ReturnType<ShelterApiService['approveRequest']>,
    successMessage: string,
    errorMessage: string,
  ): void {
    this.acting.set(true);
    request$.subscribe({
      next: (updated) => {
        this.acting.set(false);
        this.patchRequest(updated);
        this.selected.set(updated);
        this.snackBar.open(successMessage, 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        this.acting.set(false);
        this.showError(err, errorMessage);
      },
    });
  }

  private showError(err: { error?: { detail?: string } }, fallback: string): void {
    const detail = err?.error?.detail;
    this.snackBar.open(typeof detail === 'string' ? detail : fallback, 'Fechar', {
      duration: 4000,
    });
  }

  private patchRequest(updated: AdoptionRequest): void {
    this.requests.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }
}
