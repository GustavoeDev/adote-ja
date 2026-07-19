import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { AdopterProfile } from '../../../core/models/adopter.model';
import { AdopterApiService } from '../../../core/services/adopter-api.service';
import {
  cpfValidator,
  extractErrorMessage,
  formatBirthdate,
  formatCpf,
  formatPhone,
  phoneValidator,
} from '../../../shared/validators/auth.validators';
import { DeleteAccountDialogComponent } from './delete-account-dialog.component';

const PREF_OPTIONS = [
  'Cães',
  'Gatos',
  'Outros',
  'Porte pequeno',
  'Porte médio',
  'Porte grande',
  'Filhotes',
  'Adultos',
  'Idosos',
];

@Component({
  selector: 'app-adopter-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  templateUrl: './adopter-profile.component.html',
  styleUrl: './adopter-profile.component.scss',
})
export class AdopterProfileComponent implements OnInit {
  private readonly api = inject(AdopterApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editMode = signal(false);
  readonly profile = signal<AdopterProfile | null>(null);
  readonly prefs = signal<string[]>([]);
  readonly prefOptions = PREF_OPTIONS;
  readonly housingTypes = ['Casa', 'Apartamento', 'Sítio/Chácara', 'Outro'];
  readonly hoursOptions = ['0–2h', '2–4h', '4–6h', '6–8h', '8h+', 'Nunca'];

  readonly form = this.fb.nonNullable.group({
    name: [''],
    phone: ['', [phoneValidator()]],
    cpf: ['', [cpfValidator({ required: false })]],
    birthdate: [''],
    address: [''],
    city: [''],
    housing_type: [''],
    has_yard: [''],
    has_screens: [''],
    other_pets: [''],
    hours_alone: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.prefs.set([...(profile.preferences || [])]);
        this.form.patchValue({
          ...profile,
          phone: formatPhone(profile.phone || ''),
          cpf: formatCpf(profile.cpf || ''),
          birthdate: formatBirthdate(profile.birthdate || ''),
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar perfil.', 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  startEdit(): void {
    this.editMode.set(true);
  }

  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCpf(input.value);
    this.form.controls.cpf.setValue(formatted, { emitEvent: false });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatPhone(input.value);
    this.form.controls.phone.setValue(formatted, { emitEvent: false });
  }

  onBirthdateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatBirthdate(input.value);
    this.form.controls.birthdate.setValue(formatted, { emitEvent: false });
  }

  setChoice(
    control: 'housing_type' | 'has_yard' | 'has_screens' | 'hours_alone',
    value: string,
  ): void {
    this.form.controls[control].setValue(value);
  }

  togglePref(pref: string): void {
    this.prefs.update((list) =>
      list.includes(pref) ? list.filter((p) => p !== pref) : [...list, pref],
    );
    this.api.updateProfile({ preferences: this.prefs() }).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.snackBar.open('Preferências atualizadas!', 'Fechar', {
          duration: 2500,
          panelClass: 'snackbar-success',
        });
      },
      error: (err) => {
        this.snackBar.open(extractErrorMessage(err), 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  save(): void {
    if (this.form.controls.phone.invalid || (this.form.controls.cpf.value && this.form.controls.cpf.invalid)) {
      this.form.controls.phone.markAsTouched();
      this.form.controls.cpf.markAsTouched();
      this.snackBar.open('Verifique telefone e CPF informados.', 'Fechar', {
        duration: 3000,
        panelClass: 'snackbar-error',
      });
      return;
    }
    this.saving.set(true);
    this.api
      .updateProfile({
        ...this.form.getRawValue(),
        preferences: this.prefs(),
      })
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.auth.patchCurrentUser({ first_name: profile.name, phone: profile.phone });
          this.editMode.set(false);
          this.saving.set(false);
          this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: 'snackbar-success',
          });
        },
        error: (err) => {
          this.saving.set(false);
          this.snackBar.open(extractErrorMessage(err, 'Erro ao salvar perfil.'), 'Fechar', {
            duration: 4000,
            panelClass: 'snackbar-error',
          });
        },
      });
  }

  logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigate(['/login']));
  }

  openDeleteDialog(): void {
    const ref = this.dialog.open(DeleteAccountDialogComponent, {
      width: 'min(100% - 2rem, 400px)',
    });
    ref.afterClosed().subscribe((password?: string) => {
      if (!password) return;
      this.api.deleteAccount(password).subscribe({
        next: () => {
          this.auth.logout().subscribe({
            next: () => void this.router.navigate(['/login']),
            error: () => void this.router.navigate(['/login']),
          });
        },
        error: (err) => {
          this.snackBar.open(extractErrorMessage(err, 'Não foi possível excluir a conta.'), 'Fechar', {
            duration: 4000,
            panelClass: 'snackbar-error',
          });
        },
      });
    });
  }
}
