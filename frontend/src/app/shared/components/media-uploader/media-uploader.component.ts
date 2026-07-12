import { Component, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { AnimalMedia, MediaType, PendingMediaFile } from '../../../core/models/animal.model';

@Component({
  selector: 'app-media-uploader',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './media-uploader.component.html',
  styleUrl: './media-uploader.component.scss',
})
export class MediaUploaderComponent {
  readonly existingMedia = input<AnimalMedia[]>([]);
  readonly pendingFiles = input<PendingMediaFile[]>([]);

  readonly filesAdded = output<File[]>();
  readonly pendingRemoved = output<string>();
  readonly existingRemoved = output<number>();
  readonly coverSelected = output<number>();

  readonly dragging = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(): void {
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.emitValidFiles(files);
  }

  onFileInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files ?? []);
    this.emitValidFiles(files);
    inputEl.value = '';
  }

  private emitValidFiles(files: File[]): void {
    const valid = files.filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    if (valid.length) {
      this.filesAdded.emit(valid);
    }
  }

  isPhoto(type: MediaType): boolean {
    return type === 'photo';
  }
}
