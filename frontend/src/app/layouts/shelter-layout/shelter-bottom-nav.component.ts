import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-shelter-bottom-nav',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" aria-label="Navegação do abrigo">
      <a routerLink="/abrigo/dashboard" routerLinkActive="bottom-nav__item--active" class="bottom-nav__item">
        <mat-icon>dashboard</mat-icon>
        <span>Dashboard</span>
      </a>
      <button type="button" class="bottom-nav__item bottom-nav__item--disabled" disabled title="Em breve">
        <mat-icon>assignment</mat-icon>
        <span>Pedidos</span>
      </button>
      <button type="button" class="bottom-nav__item bottom-nav__item--disabled" disabled title="Em breve">
        <mat-icon>home_work</mat-icon>
        <span>Perfil</span>
      </button>
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
      font-size: 0.6875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .bottom-nav__item mat-icon {
      font-size: 1.375rem;
      width: 1.375rem;
      height: 1.375rem;
    }

    .bottom-nav__item--active {
      color: var(--adoteja-primary);
    }

    .bottom-nav__item--disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media (min-width: 768px) {
      .bottom-nav {
        display: none;
      }
    }
  `,
})
export class ShelterBottomNavComponent {}
