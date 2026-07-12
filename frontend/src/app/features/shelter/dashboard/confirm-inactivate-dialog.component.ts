import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-inactivate-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Confirmar inativação</h2>
    <mat-dialog-content>
      <div class="warning">
        <mat-icon>warning</mat-icon>
        <p>
          Deseja inativar <strong>{{ data.name }}</strong>? O animal não aparecerá mais no feed de
          adoção.
        </p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" (click)="confirm()">Inativar</button>
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

    mat-dialog-actions {
      gap: 0.5rem;
      padding: 0 1.5rem 1.25rem;
    }
  `,
})
export class ConfirmInactivateDialogComponent {
  readonly data = inject<{ name: string }>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmInactivateDialogComponent>);

  confirm(): void {
    this.ref.close(true);
  }
}
