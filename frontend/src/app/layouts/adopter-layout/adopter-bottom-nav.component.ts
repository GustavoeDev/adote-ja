import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-adopter-bottom-nav',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" aria-label="Navegação do adotante">
      <a routerLink="/adotante/inicio" routerLinkActive="bottom-nav__item--active" class="bottom-nav__item">
        <mat-icon>home</mat-icon>
        <span>Início</span>
      </a>
      <a routerLink="/adotante/pedidos" routerLinkActive="bottom-nav__item--active" class="bottom-nav__item">
        <mat-icon>assignment</mat-icon>
        <span>Pedidos</span>
      </a>
      <a routerLink="/adotante/perfil" routerLinkActive="bottom-nav__item--active" class="bottom-nav__item">
        <mat-icon>person</mat-icon>
        <span>Perfil</span>
      </a>
    </nav>
  `,
  styles: `
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 40;
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: var(--adoteja-nav-height);
      background: var(--adoteja-surface);
      border-top: 1px solid rgba(25, 28, 25, 0.09);
      padding-bottom: env(safe-area-inset-bottom);
    }

    .bottom-nav__item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.125rem;
      min-height: 48px;
      border: none;
      background: transparent;
      color: var(--adoteja-text-muted);
      text-decoration: none;
      font-size: 0.625rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .bottom-nav__item mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .bottom-nav__item--active {
      color: var(--adoteja-primary);
    }

    @media (min-width: 768px) {
      .bottom-nav {
        display: none;
      }
    }
  `,
})
export class AdopterBottomNavComponent {}
