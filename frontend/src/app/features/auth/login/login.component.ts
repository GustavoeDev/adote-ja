import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthHeroComponent } from '../../../shared/components/auth-hero/auth-hero.component';
import { extractErrorMessage } from '../../../shared/validators/auth.validators';

@Component({
  selector: 'app-login',
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
    AuthHeroComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly loading = this.auth.loading;

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: 'snackbar-success',
        });
        this.auth.redirectAfterLogin();
      },
      error: (err) => {
        this.snackBar.open(extractErrorMessage(err, 'E-mail ou senha incorretos.'), 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.form.reset();
      this.snackBar.open('Logout realizado.', 'Fechar', { duration: 3000 });
    });
  }
}
