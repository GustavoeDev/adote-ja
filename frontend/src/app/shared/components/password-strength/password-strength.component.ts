import { Component, input } from '@angular/core';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  template: `
    @if (password().length > 0) {
      <div class="strength">
        <div class="strength__bars">
          @for (bar of [1, 2, 3]; track bar) {
            <div class="strength__bar" [class]="barClass(bar)"></div>
          }
        </div>
        <p class="strength__label" [class]="labelClass()">Senha {{ label() }}</p>
      </div>
    }
  `,
  styles: `
    .strength {
      margin-top: 0.25rem;
    }

    .strength__bars {
      display: flex;
      gap: 0.25rem;
    }

    .strength__bar {
      flex: 1;
      height: 4px;
      border-radius: 999px;
      background: #edf1ed;
      transition: background 0.3s ease;
    }

    .strength__bar--weak {
      background: #f87171;
    }

    .strength__bar--medium {
      background: #fbbf24;
    }

    .strength__bar--strong {
      background: #10b981;
    }

    .strength__label {
      font-size: 0.75rem;
      font-weight: 600;
      margin: 0.25rem 0 0;
    }

    .strength__label--weak {
      color: #ef4444;
    }

    .strength__label--medium {
      color: #f59e0b;
    }

    .strength__label--strong {
      color: #059669;
    }
  `,
})
export class PasswordStrengthComponent {
  readonly password = input('');

  strength(): number {
    const pw = this.password();
    if (!pw.length) return 0;
    if (pw.length < 8) return 1;
    if (pw.length < 12) return 2;
    return 3;
  }

  label(): string {
    return ['', 'Fraca', 'Média', 'Forte'][this.strength()];
  }

  labelClass(): string {
    const s = this.strength();
    if (s === 1) return 'strength__label--weak';
    if (s === 2) return 'strength__label--medium';
    return 'strength__label--strong';
  }

  barClass(bar: number): string {
    const s = this.strength();
    if (bar > s) return '';
    if (s === 1) return 'strength__bar--weak';
    if (s === 2) return 'strength__bar--medium';
    return 'strength__bar--strong';
  }
}
