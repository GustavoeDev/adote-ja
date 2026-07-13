import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AdopterProfile, DiscoverAnimalDetail } from '../../../core/models/adopter.model';
import { AdopterApiService } from '../../../core/services/adopter-api.service';
import { extractErrorMessage } from '../../../shared/validators/auth.validators';

@Component({
  selector: 'app-adoption-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './adoption-form.component.html',
  styleUrl: './adoption-form.component.scss',
})
export class AdoptionFormComponent implements OnInit {
  private readonly api = inject(AdopterApiService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly step = signal(1);
  readonly animal = signal<DiscoverAnimalDetail | null>(null);
  readonly profile = signal<AdopterProfile | null>(null);

  readonly housingTypes = ['Casa', 'Apartamento', 'Sítio/Chácara', 'Outro'];
  readonly hoursOptions = ['0–2h', '2–4h', '4–6h', '6–8h', '8h+', 'Nunca'];
  readonly steps = ['Dados Pessoais', 'Moradia', 'Motivação'];

  readonly form = this.fb.nonNullable.group({
    adopter_name: ['', [Validators.required, Validators.maxLength(150)]],
    adopter_cpf: ['', [Validators.required]],
    adopter_phone: ['', Validators.required],
    adopter_email: ['', [Validators.required, Validators.email]],
    adopter_address: ['', Validators.required],
    adopter_city: ['', Validators.required],
    housing_type: ['', Validators.required],
    has_yard: [''],
    other_pets: [''],
    motivation: ['', Validators.required],
    experience: [''],
    hours_alone: [''],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      void this.router.navigate(['/adotante/inicio']);
      return;
    }

    forkJoin({
      animal: this.api.getAnimal(id),
      profile: this.api.getProfile(),
    }).subscribe({
      next: ({ animal, profile }) => {
        this.animal.set(animal);
        this.profile.set(profile);
        this.form.patchValue({
          adopter_name: profile.name || '',
          adopter_phone: profile.phone || '',
          adopter_email: profile.email || '',
          adopter_address: profile.address || '',
          adopter_city: profile.city || '',
          housing_type: profile.housing_type || '',
          has_yard: profile.has_yard || '',
          other_pets: profile.other_pets || '',
          hours_alone: profile.hours_alone || '',
        });
        this.loading.set(false);
        if (animal.has_active_request || animal.status !== 'available') {
          this.snackBar.open('Este animal não está disponível para nova solicitação.', 'Fechar', {
            duration: 4000,
            panelClass: 'snackbar-error',
          });
          void this.router.navigate(['/adotante/animais', id]);
        }
      },
      error: () => {
        this.loading.set(false);
        void this.router.navigate(['/adotante/inicio']);
      },
    });
  }

  setChoice(control: 'housing_type' | 'has_yard' | 'hours_alone', value: string): void {
    this.form.controls[control].setValue(value);
  }

  next(): void {
    if (this.step() === 1) {
      const ok =
        this.form.controls.adopter_name.valid &&
        this.form.controls.adopter_cpf.valid &&
        this.form.controls.adopter_phone.valid &&
        this.form.controls.adopter_email.valid;
      if (!ok) {
        this.form.markAllAsTouched();
        return;
      }
    }
    if (this.step() === 2) {
      const ok =
        this.form.controls.adopter_address.valid &&
        this.form.controls.adopter_city.valid &&
        this.form.controls.housing_type.valid;
      if (!ok) {
        this.form.markAllAsTouched();
        return;
      }
    }
    this.step.update((s) => Math.min(3, s + 1));
  }

  back(): void {
    if (this.step() === 1) {
      const a = this.animal();
      if (a) void this.router.navigate(['/adotante/animais', a.id]);
      return;
    }
    this.step.update((s) => Math.max(1, s - 1));
  }

  submit(): void {
    if (this.form.controls.motivation.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const a = this.animal();
    if (!a) return;

    this.submitting.set(true);
    this.api
      .createRequest({
        animal_id: a.id,
        ...this.form.getRawValue(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.success.set(true);
          setTimeout(() => void this.router.navigate(['/adotante/pedidos']), 2200);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(extractErrorMessage(err, 'Erro ao enviar solicitação.'), 'Fechar', {
            duration: 4500,
            panelClass: 'snackbar-error',
          });
        },
      });
  }
}
