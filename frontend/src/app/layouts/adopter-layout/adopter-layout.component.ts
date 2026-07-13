import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { AdopterBottomNavComponent } from './adopter-bottom-nav.component';
import { AdopterSidebarComponent } from './adopter-sidebar.component';

@Component({
  selector: 'app-adopter-layout',
  standalone: true,
  imports: [RouterOutlet, AdopterBottomNavComponent, AdopterSidebarComponent, MatIconModule],
  template: `
    <div class="adopter-layout" [class.adopter-layout--drawer-open]="drawerOpen()">
      @if (drawerOpen()) {
        <button
          type="button"
          class="adopter-layout__backdrop"
          aria-label="Fechar menu"
          (click)="closeDrawer()"
        ></button>
      }

      <app-adopter-sidebar
        [open]="drawerOpen()"
        (logout)="logout()"
        (navClick)="closeDrawer()"
      />

      <div class="adopter-layout__content">
        <header class="adopter-topbar">
          <button
            type="button"
            class="adopter-topbar__menu"
            aria-label="Abrir menu"
            (click)="openDrawer()"
          >
            <mat-icon>menu</mat-icon>
          </button>
          <div class="adopter-topbar__brand">
            <mat-icon>pets</mat-icon>
            <span>AdoteJá</span>
          </div>
          <div class="adopter-topbar__spacer"></div>
        </header>

        <main class="adopter-layout__main" [class.adopter-layout__main--flush]="hideChrome()">
          <router-outlet />
        </main>
      </div>

      @if (!hideChrome()) {
        <app-adopter-bottom-nav />
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      flex: 1;
      min-height: 100dvh;
    }

    .adopter-layout {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .adopter-layout__backdrop {
      display: none;
    }

    .adopter-layout__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .adopter-topbar {
      display: none;
    }

    .adopter-layout__main {
      flex: 1;
      width: 100%;
      max-width: var(--content-max);
      margin: 0 auto;
      padding: 1rem 1rem calc(var(--adoteja-nav-height) + 1rem);
    }

    .adopter-layout__main--flush {
      max-width: none;
      padding: 0;
    }

    @media (min-width: 768px) {
      .adopter-topbar {
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

      .adopter-topbar__menu {
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
      }

      .adopter-topbar__brand {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-weight: 800;
        font-size: 1rem;
        color: var(--adoteja-primary);
      }

      .adopter-topbar__spacer {
        flex: 1;
      }

      .adopter-layout__backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 45;
        border: none;
        padding: 0;
        background: rgba(19, 28, 25, 0.45);
        cursor: pointer;
      }

      .adopter-layout__main {
        padding: 1.5rem 2rem 2rem;
      }

      .adopter-layout__main--flush {
        padding: 0;
      }
    }

    @media (min-width: 1024px) {
      .adopter-layout {
        flex-direction: row;
        align-items: stretch;
      }

      .adopter-topbar {
        display: none;
      }

      .adopter-layout__backdrop {
        display: none !important;
      }

      .adopter-layout__main {
        max-width: none;
        padding: 2rem 2.5rem;
      }

      .adopter-layout__main--flush {
        padding: 0;
      }
    }
  `,
})
export class AdopterLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly drawerOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly hideChrome = computed(() => {
    const path = this.url();
    return /\/adotante\/animais\/\d+(\/adotar)?/.test(path) || /\/adotante\/abrigos\/\d+/.test(path);
  });

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
