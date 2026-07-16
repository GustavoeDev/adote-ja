import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmActivityDialogData {
  name: string;
  action: 'inactivate' | 'activate';
}

@Component({
  selector: 'app-confirm-inactivate-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content>
      <div class="warning" [class.warning--activate]="data.action === 'activate'">
        <mat-icon>{{ data.action === 'activate' ? 'check_circle' : 'warning' }}</mat-icon>
        @if (data.action === 'activate') {
          <p>
            Deseja reativar <strong>{{ data.name }}</strong>? O animal voltará a aparecer no feed de
            adoção (se estiver disponível).
          </p>
        } @else {
          <p>
            Deseja inativar <strong>{{ data.name }}</strong>? O animal não aparecerá mais no feed de
            adoção.
          </p>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button
        mat-flat-button
        [color]="data.action === 'activate' ? 'primary' : 'warn'"
        (click)="confirm()"
      >
        {{ confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .warning {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 0.75rem;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 0.75rem;
    }

    .warning mat-icon {
      color: #d97706;
      flex-shrink: 0;
    }

    .warning p {
      margin: 0;
      font-size: 0.875rem;
      color: #92400e;
      line-height: 1.5;
    }

    .warning--activate {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }

    .warning--activate mat-icon {
      color: #059669;
    }

    .warning--activate p {
      color: #065f46;
    }

    mat-dialog-actions {
      gap: 0.5rem;
      padding: 0 1.5rem 1.25rem;
      margin-top: 1rem;
    }
  `,
})
export class ConfirmInactivateDialogComponent {
  readonly data = inject<ConfirmActivityDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmInactivateDialogComponent>);

  get title(): string {
    return this.data.action === 'activate' ? 'Confirmar reativação' : 'Confirmar inativação';
  }

  get confirmLabel(): string {
    return this.data.action === 'activate' ? 'Reativar' : 'Inativar';
  }

  confirm(): void {
    this.ref.close(true);
  }
}
