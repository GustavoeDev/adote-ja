import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { AuthHeroComponent } from '../../../shared/components/auth-hero/auth-hero.component';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength.component';
import {
  extractErrorMessage,
  formatPhone,
  phoneValidator,
  strongPasswordValidator,
} from '../../../shared/validators/auth.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  host: { class: 'auth-route-host' },
  styles: `
    :host {
      display: flex;
      flex: 1;
      min-height: 100dvh;
      width: 100%;
    }
  `,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PasswordStrengthComponent,
    AuthHeroComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly activeRole = signal<UserRole>('adopter');
  readonly loading = this.auth.loading;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, phoneValidator()]],
    password: ['', [Validators.required, strongPasswordValidator()]],
  });

  setRole(role: UserRole): void {
    this.activeRole.set(role);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatPhone(input.value);
    this.form.controls.phone.setValue(formatted, { emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, phone, password } = this.form.getRawValue();
    this.auth
      .register({
        role: this.activeRole(),
        name,
        email,
        phone,
        password,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Conta criada! Faça login para continuar.', 'Fechar', {
            duration: 4000,
            panelClass: 'snackbar-success',
          });
          void this.router.navigate(['/login']);
        },
        error: (err) => {
          this.snackBar.open(extractErrorMessage(err), 'Fechar', {
            duration: 5000,
            panelClass: 'snackbar-error',
          });
        },
      });
  }
}
