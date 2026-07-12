import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { Animal, ShelterProfile } from '../../../core/models/animal.model';
import { ShelterApiService } from '../../../core/services/shelter-api.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { extractErrorMessage } from '../../../shared/validators/auth.validators';

@Component({
  selector: 'app-shelter-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    StatusBadgeComponent,
  ],
  templateUrl: './shelter-profile.component.html',
  styleUrl: './shelter-profile.component.scss',
})
export class ShelterProfileComponent implements OnInit {
  private readonly api = inject(ShelterApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editMode = signal(false);
  readonly dragging = signal(false);
  readonly activeTab = signal(0);
  readonly profile = signal<ShelterProfile | null>(null);
  readonly animals = signal<Animal[]>([]);
  readonly coverPreview = signal<string | null>(null);
  readonly avatarPreview = signal<string | null>(null);

  private pendingCover: File | null = null;
  private pendingAvatar: File | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    about: [''],
    public_phone: [''],
    public_email: ['', [Validators.email]],
    website: [''],
    city: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    forkJoin({
      profile: this.api.getProfile(),
      animals: this.api.listAnimals(),
    }).subscribe({
      next: ({ profile, animals }) => {
        this.applyProfile(profile);
        this.animals.set(animals);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar o perfil.', 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  private applyProfile(profile: ShelterProfile): void {
    this.profile.set(profile);
    this.patchForm(profile);
    this.coverPreview.set(profile.cover_photo_url);
    this.avatarPreview.set(profile.profile_photo_url);
  }

  private patchForm(profile: ShelterProfile): void {
    this.form.patchValue({
      name: profile.name,
      about: profile.about,
      public_phone: profile.public_phone,
      public_email: profile.public_email,
      website: profile.website,
      city: profile.city,
    });
  }

  setTab(index: number): void {
    this.activeTab.set(index);
  }

  startEdit(): void {
    const profile = this.profile();
    if (profile) this.patchForm(profile);
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.revokeIfBlob(this.coverPreview());
    this.revokeIfBlob(this.avatarPreview());
    const profile = this.profile();
    if (profile) this.applyProfile(profile);
    this.pendingCover = null;
    this.pendingAvatar = null;
    this.editMode.set(false);
  }

  onDragOver(event: DragEvent): void {
    if (!this.editMode()) return;
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(): void {
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    if (!this.editMode()) return;
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.setCoverFile(file);
  }

  onCoverInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setCoverFile(file);
    input.value = '';
  }

  onAvatarInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setAvatarFile(file);
    input.value = '';
  }

  private setCoverFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('A capa deve ser uma imagem.', 'Fechar', {
        duration: 3000,
        panelClass: 'snackbar-error',
      });
      return;
    }
    this.revokeIfBlob(this.coverPreview());
    this.pendingCover = file;
    this.coverPreview.set(URL.createObjectURL(file));
  }

  private setAvatarFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('A foto de perfil deve ser uma imagem.', 'Fechar', {
        duration: 3000,
        panelClass: 'snackbar-error',
      });
      return;
    }
    this.revokeIfBlob(this.avatarPreview());
    this.pendingAvatar = file;
    this.avatarPreview.set(URL.createObjectURL(file));
  }

  private revokeIfBlob(url: string | null): void {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  }

  displayWebsite(url: string): string {
    return url.replace(/^https?:\/\//, '');
  }

  editAnimal(animal: Animal): void {
    void this.router.navigate(['/abrigo/animais', animal.id, 'editar']);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();

    this.api
      .updateProfile(payload)
      .pipe(
        switchMap((profile) =>
          this.pendingCover ? this.api.uploadCover(this.pendingCover) : of(profile),
        ),
        switchMap((profile) =>
          this.pendingAvatar ? this.api.uploadAvatar(this.pendingAvatar) : of(profile),
        ),
      )
      .subscribe({
        next: (finalProfile) => {
          this.applyProfile(finalProfile);
          this.pendingCover = null;
          this.pendingAvatar = null;
          this.editMode.set(false);
          this.saving.set(false);
          this.auth.patchCurrentUser({
            first_name: finalProfile.name,
            shelter_name: finalProfile.name,
          });
          this.snackBar.open('Perfil do abrigo atualizado!', 'Fechar', {
            duration: 3500,
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
}
