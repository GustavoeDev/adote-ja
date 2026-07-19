import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdoptionRequest } from '../../../core/models/adoption.model';

export type ReviewDataDialogResult = 'approve' | 'reject' | null;

@Component({
  selector: 'app-review-request-data-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Dados da solicitação</h2>
    <mat-dialog-content>
      <p class="lead">
        Revise as informações enviadas por <strong>{{ data.adopter_name }}</strong> para adotar
        <strong>{{ data.animal_name }}</strong>.
      </p>

      <section class="block">
        <h3>Dados pessoais</h3>
        <dl class="grid">
          <div>
            <dt>Nome</dt>
            <dd>{{ data.adopter_name || '—' }}</dd>
          </div>
          <div>
            <dt>CPF</dt>
            <dd>{{ data.adopter_cpf || '—' }}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{{ data.adopter_phone || '—' }}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{{ data.adopter_email || '—' }}</dd>
          </div>
          <div class="full">
            <dt>Endereço</dt>
            <dd>{{ data.adopter_address || '—' }}</dd>
          </div>
          <div>
            <dt>Cidade</dt>
            <dd>{{ data.adopter_city || '—' }}</dd>
          </div>
        </dl>
      </section>

      <section class="block">
        <h3>Moradia</h3>
        <dl class="grid">
          <div>
            <dt>Tipo</dt>
            <dd>{{ data.housing_type || '—' }}</dd>
          </div>
          <div>
            <dt>Quintal / área externa</dt>
            <dd>{{ yardLabel(data.has_yard) }}</dd>
          </div>
          <div class="full">
            <dt>Outros animais</dt>
            <dd>{{ data.other_pets || 'Não informado' }}</dd>
          </div>
          <div>
            <dt>Horas sozinho</dt>
            <dd>{{ data.hours_alone || '—' }}</dd>
          </div>
        </dl>
      </section>

      <section class="block">
        <h3>Motivação</h3>
        <dl class="stack">
          <div>
            <dt>Por que deseja adotar?</dt>
            <dd>{{ data.motivation || data.message || '—' }}</dd>
          </div>
          <div>
            <dt>Experiência com animais</dt>
            <dd>{{ data.experience || 'Não informado' }}</dd>
          </div>
        </dl>
      </section>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" [disabled]="busy" mat-dialog-close>Fechar</button>
      <button
        mat-stroked-button
        type="button"
        class="reject"
        [disabled]="busy"
        (click)="reject()"
      >
        Recusar cadastro
      </button>
      <button mat-flat-button color="primary" type="button" [disabled]="busy" (click)="approve()">
        @if (busy) {
          <mat-spinner diameter="18"></mat-spinner>
        } @else {
          Aprovar cadastro
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .lead {
      margin: 0 0 1rem;
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--adoteja-text-muted, #5c665c);
    }

    mat-dialog-content {
      min-width: min(100%, 28rem);
      max-height: 70vh;
    }

    .block {
      margin-bottom: 1.125rem;
    }

    .block h3 {
      margin: 0 0 0.5rem;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--adoteja-text-muted, #5c665c);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin: 0;
    }

    .grid .full {
      grid-column: 1 / -1;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin: 0;
    }

    dt {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--adoteja-text-muted, #5c665c);
      margin-bottom: 0.15rem;
    }

    dd {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.4;
      word-break: break-word;
    }

    mat-dialog-actions {
      gap: 0.5rem;
      padding: 0 1.5rem 1.25rem;
      flex-wrap: wrap;
    }

    .reject {
      color: #dc2626 !important;
      border-color: rgba(220, 38, 38, 0.35) !important;
    }

    @media (max-width: 520px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ReviewRequestDataDialogComponent {
  readonly data = inject<AdoptionRequest>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ReviewRequestDataDialogComponent, ReviewDataDialogResult>);
  busy = false;

  yardLabel(value?: string): string {
    if (!value) return '—';
    const map: Record<string, string> = {
      yes: 'Sim',
      no: 'Não',
      sim: 'Sim',
      nao: 'Não',
      não: 'Não',
    };
    return map[value.toLowerCase()] || value;
  }

  approve(): void {
    this.ref.close('approve');
  }

  reject(): void {
    this.ref.close('reject');
  }
}
