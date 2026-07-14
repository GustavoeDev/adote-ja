import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface RejectRequestDialogData {
  adopterName: string;
  animalName: string;
  title?: string;
  lead?: string;
}

@Component({
  selector: 'app-reject-request-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Recusar solicitação' }}</h2>
    <mat-dialog-content>
      <p class="lead">
        {{
          data.lead ||
            ('Informe o motivo da rejeição do pedido de ' +
              data.adopterName +
              ' para ' +
              data.animalName +
              '.')
        }}
      </p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Motivo da rejeição</mat-label>
          <textarea
            matInput
            rows="4"
            formControlName="reason"
            placeholder="Ex.: o ambiente informado não é adequado para o animal."
          ></textarea>
          @if (form.controls.reason.touched && form.controls.reason.invalid) {
            <mat-error>Informe um motivo com pelo menos 5 caracteres.</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" type="button" (click)="confirm()">Recusar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .lead {
      margin: 0 0 1rem;
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--adoteja-text-muted, #5c665c);
    }

    .full {
      width: 100%;
    }

    mat-dialog-content {
      min-width: min(100%, 22rem);
    }

    mat-dialog-actions {
      gap: 0.5rem;
      padding: 0 1.5rem 1.25rem;
    }
  `,
})
export class RejectRequestDialogComponent {
  readonly data = inject<RejectRequestDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<RejectRequestDialogComponent, string>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  confirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close(this.form.controls.reason.value.trim());
  }
}
