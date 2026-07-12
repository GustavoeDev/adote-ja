import { Component, input } from '@angular/core';

import { AnimalStatus } from '../../../core/models/animal.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="statusClass()">{{ label() }}</span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .badge--available {
      background: #ecfdf5;
      color: #059669;
    }

    .badge--in_process {
      background: #fffbeb;
      color: #d97706;
    }

    .badge--adopted {
      background: #eff6ff;
      color: #2563eb;
    }
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<AnimalStatus>();

  label(): string {
    const map: Record<AnimalStatus, string> = {
      available: 'Disponível',
      in_process: 'Em processo',
      adopted: 'Adotado',
    };
    return map[this.status()];
  }

  statusClass(): string {
    return `badge--${this.status()}`;
  }
}
