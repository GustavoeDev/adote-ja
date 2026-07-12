import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';

import {
  AnimalDetail,
  AnimalMedia,
  AnimalSize,
  AnimalSpecies,
  PendingMediaFile,
} from '../../../core/models/animal.model';
import { ShelterApiService } from '../../../core/services/shelter-api.service';
import { MediaUploaderComponent } from '../../../shared/components/media-uploader/media-uploader.component';
import { extractErrorMessage } from '../../../shared/validators/auth.validators';

@Component({
  selector: 'app-animal-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MediaUploaderComponent,
  ],
  templateUrl: './animal-form.component.html',
  styleUrl: './animal-form.component.scss',
})
export class AnimalFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ShelterApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly loadingAnimal = signal(false);
  readonly animalId = signal<number | null>(null);
  readonly existingMedia = signal<AnimalMedia[]>([]);
  readonly pendingFiles = signal<PendingMediaFile[]>([]);
  readonly species = signal<AnimalSpecies | ''>('');
  readonly size = signal<AnimalSize | ''>('');
  readonly vaccinated = signal(false);
  readonly neutered = signal(false);

  readonly speciesOptions: { id: AnimalSpecies; label: string; icon: string }[] = [
    { id: 'dog', label: 'Cão', icon: 'pets' },
    { id: 'cat', label: 'Gato', icon: 'cruelty_free' },
    { id: 'rabbit', label: 'Coelho', icon: 'emoji_nature' },
    { id: 'other', label: 'Outro', icon: 'spa' },
  ];

  readonly sizeOptions: { id: AnimalSize; label: string }[] = [
    { id: 'small', label: 'P' },
    { id: 'medium', label: 'M' },
    { id: 'large', label: 'G' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    breed: [''],
    age_text: [''],
    weight: [''],
    description: [''],
  });

  get isEdit(): boolean {
    return this.animalId() !== null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.animalId.set(id);
      this.loadAnimal(id);
    }
  }

  ngOnDestroy(): void {
    this.pendingFiles().forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }

  loadAnimal(id: number): void {
    this.loadingAnimal.set(true);
    this.api.getAnimal(id).subscribe({
      next: (animal) => {
        this.patchForm(animal);
        this.loadingAnimal.set(false);
      },
      error: () => {
        this.loadingAnimal.set(false);
        this.snackBar.open('Animal não encontrado.', 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
        void this.router.navigate(['/abrigo/dashboard']);
      },
    });
  }

  private patchForm(animal: AnimalDetail): void {
    this.form.patchValue({
      name: animal.name,
      breed: animal.breed,
      age_text: animal.age_text,
      weight: animal.weight,
      description: animal.description,
    });
    this.species.set(animal.species);
    this.size.set(animal.size || '');
    this.vaccinated.set(animal.vaccinated);
    this.neutered.set(animal.neutered);
    this.existingMedia.set(animal.media);
  }

  setSpecies(value: AnimalSpecies): void {
    this.species.set(value);
  }

  setSize(value: AnimalSize): void {
    this.size.set(value);
  }

  toggleVaccinated(): void {
    this.vaccinated.update((v) => !v);
  }

  toggleNeutered(): void {
    this.neutered.update((v) => !v);
  }

  onFilesAdded(files: File[]): void {
    const next = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      mediaType: (file.type.startsWith('video/') ? 'video' : 'photo') as 'photo' | 'video',
    }));
    this.pendingFiles.update((list) => [...list, ...next]);
  }

  onPendingRemoved(id: string): void {
    this.pendingFiles.update((list) => {
      const item = list.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return list.filter((p) => p.id !== id);
    });
  }

  onExistingRemoved(mediaId: number): void {
    const animalId = this.animalId();
    if (!animalId) return;
    this.api.deleteMedia(animalId, mediaId).subscribe({
      next: (animal) => {
        this.existingMedia.set(animal.media);
        this.snackBar.open('Mídia removida.', 'Fechar', { duration: 2500 });
      },
      error: (err) => {
        this.snackBar.open(extractErrorMessage(err, 'Erro ao remover mídia.'), 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  onCoverSelected(mediaId: number): void {
    const animalId = this.animalId();
    if (!animalId) return;
    this.api.setCover(animalId, mediaId).subscribe({
      next: (animal) => this.existingMedia.set(animal.media),
      error: (err) => {
        this.snackBar.open(extractErrorMessage(err, 'Erro ao definir capa.'), 'Fechar', {
          duration: 4000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  submit(): void {
    if (this.form.invalid || !this.species()) {
      this.form.markAllAsTouched();
      if (!this.species()) {
        this.snackBar.open('Selecione a espécie do animal.', 'Fechar', {
          duration: 3000,
          panelClass: 'snackbar-error',
        });
      }
      return;
    }

    const { name, breed, age_text, weight, description } = this.form.getRawValue();
    const payload = {
      name,
      species: this.species() as AnimalSpecies,
      breed,
      age_text,
      weight,
      size: this.size(),
      description,
      vaccinated: this.vaccinated(),
      neutered: this.neutered(),
    };

    this.loading.set(true);
    const animalId = this.animalId();
    const pending = this.pendingFiles().map((p) => p.file);

    const save$ = animalId
      ? this.api.updateAnimal(animalId, payload)
      : this.api.createAnimal(payload);

    save$
      .pipe(
        switchMap((animal) => {
          if (!pending.length) {
            return of(animal);
          }
          return this.api.uploadMedia(animal.id, pending);
        }),
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.pendingFiles().forEach((p) => URL.revokeObjectURL(p.previewUrl));
          this.pendingFiles.set([]);
          this.snackBar.open(
            animalId ? 'Animal atualizado com sucesso!' : 'Animal cadastrado com sucesso!',
            'Fechar',
            { duration: 3500, panelClass: 'snackbar-success' },
          );
          void this.router.navigate(['/abrigo/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          this.snackBar.open(extractErrorMessage(err, 'Erro ao salvar animal.'), 'Fechar', {
            duration: 5000,
            panelClass: 'snackbar-error',
          });
        },
      });
  }
}
