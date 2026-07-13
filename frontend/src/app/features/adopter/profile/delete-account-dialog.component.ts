import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-delete-account-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Excluir conta</h2>
    <mat-dialog-content>
      <div class="warn">
        <mat-icon>warning</mat-icon>
        <p>Esta ação é irreversível. Todos os seus dados e solicitações serão excluídos permanentemente.</p>
      </div>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Confirme sua senha</mat-label>
          <input matInput type="password" formControlName="password" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="form.invalid" (click)="confirm()">
        Excluir conta
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .warn {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 0.75rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      margin-bottom: 1rem;
      color: #991b1b;
    }
    .warn mat-icon {
      flex: none;
      margin-top: 0.1rem;
    }
    .warn p {
      margin: 0;
      font-size: 0.875rem;
    }
    .full {
      width: 100%;
    }
  `,
})
export class DeleteAccountDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<DeleteAccountDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true });

  readonly form = this.fb.nonNullable.group({
    password: ['', Validators.required],
  });

  confirm(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.controls.password.value);
  }
}
