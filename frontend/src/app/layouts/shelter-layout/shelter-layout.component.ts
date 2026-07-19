import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ShelterBottomNavComponent } from './shelter-bottom-nav.component';
import { ShelterSidebarComponent } from './shelter-sidebar.component';

@Component({
  selector: 'app-shelter-layout',
  standalone: true,
  imports: [RouterOutlet, ShelterBottomNavComponent, ShelterSidebarComponent, MatIconModule],
  template: `
    <div class="shelter-layout" [class.shelter-layout--drawer-open]="drawerOpen()">
      @if (drawerOpen()) {
        <button
          type="button"
          class="shelter-layout__backdrop"
          aria-label="Fechar menu"
          (click)="closeDrawer()"
        ></button>
      }

      <app-shelter-sidebar
        [open]="drawerOpen()"
        (logout)="logout()"
        (navClick)="closeDrawer()"
      />

      <div class="shelter-layout__content">
        <header class="shelter-topbar">
          <button
            type="button"
            class="shelter-topbar__menu"
            aria-label="Abrir menu"
            (click)="openDrawer()"
          >
            <mat-icon>menu</mat-icon>
          </button>
          <div class="shelter-topbar__brand">
            <mat-icon>pets</mat-icon>
            <span>AdoteJá</span>
          </div>
          <div class="shelter-topbar__spacer"></div>
        </header>

        <main class="shelter-layout__main">
          <router-outlet />
        </main>
      </div>

      <app-shelter-bottom-nav />
    </div>
  `,
  styles: `
    :host {
      display: block;
      flex: 1;
      min-height: 100dvh;
    }

    .shelter-layout {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .shelter-layout__backdrop {
      display: none;
    }

    .shelter-layout__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .shelter-topbar {
      display: none;
    }

    .shelter-layout__main {
      flex: 1;
      width: 100%;
      max-width: var(--content-max);
      margin: 0 auto;
      padding: 1rem 1rem calc(var(--adoteja-nav-height) + 1rem);
    }

    @media (min-width: 768px) {
      .shelter-topbar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1.25rem;
        background: var(--adoteja-surface);
        border-bottom: 1px solid rgba(25, 28, 25, 0.08);
        position: sticky;
        top: 0;
        z-index: 30;
      }

      .shelter-topbar__menu {
        width: 2.75rem;
        height: 2.75rem;
        border: none;
        border-radius: 0.75rem;
        background: var(--adoteja-primary-light);
        color: var(--adoteja-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.15s ease;
      }

      .shelter-topbar__menu:hover {
        background: #d4eadc;
      }

      .shelter-topbar__menu:active {
        transform: scale(0.96);
      }

      .shelter-topbar__brand {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-weight: 800;
        font-size: 1rem;
        color: var(--adoteja-primary);
      }

      .shelter-topbar__brand mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }

      .shelter-topbar__spacer {
        flex: 1;
      }

      .shelter-layout__backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 45;
        border: none;
        padding: 0;
        background: rgba(19, 28, 25, 0.45);
        backdrop-filter: blur(2px);
        animation: fade-in 0.2s ease;
        cursor: pointer;
      }

      .shelter-layout__main {
        padding: 1.5rem 2rem 2rem;
      }
    }

    @media (min-width: 1024px) {
      .shelter-layout {
        flex-direction: row;
        align-items: stretch;
      }

      .shelter-topbar {
        display: none;
      }

      .shelter-layout__backdrop {
        display: none !important;
      }

      .shelter-layout__main {
        max-width: none;
        padding: 2rem 2.5rem;
      }
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
})
export class ShelterLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly drawerOpen = signal(false);

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  logout(): void {
    this.closeDrawer();
    this.auth.logout().subscribe(() => void this.router.navigate(['/login']));
  }
}
