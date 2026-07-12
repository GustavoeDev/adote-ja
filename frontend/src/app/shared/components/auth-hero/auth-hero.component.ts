import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-hero',
  standalone: true,
  imports: [MatIconModule],
  host: { class: 'auth-hero-host' },
  styles: `
    :host {
      display: contents;
    }
  `,
  template: `
    <aside class="auth-hero" aria-hidden="false">
      <div class="auth-hero__content">
        <div class="auth-hero__icon">
          <mat-icon>pets</mat-icon>
        </div>
        <h1 class="auth-hero__title">AdoteJá</h1>
        <p class="auth-hero__subtitle">
          Conectando vidas, transformando futuros. A plataforma que aproxima abrigos, ONGs e famílias
          prontas para adotar.
        </p>
        <ul class="auth-hero__features">
          <li class="auth-hero__feature">
            <span class="auth-hero__feature-icon"><mat-icon>favorite</mat-icon></span>
            Adoção responsável e transparente
          </li>
          <li class="auth-hero__feature">
            <span class="auth-hero__feature-icon"><mat-icon>photo_library</mat-icon></span>
            Galerias de fotos e vídeos dos animais
          </li>
          <li class="auth-hero__feature">
            <span class="auth-hero__feature-icon"><mat-icon>verified</mat-icon></span>
            Abrigos verificados e perfis completos
          </li>
        </ul>
      </div>
      <mat-icon class="auth-hero__paws" aria-hidden="true">pets</mat-icon>
    </aside>
  `,
})
export class AuthHeroComponent {}
