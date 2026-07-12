import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-shelter-sidebar',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.sidebar--open]="open()" aria-label="Menu do abrigo">
      <div class="sidebar__glow" aria-hidden="true"></div>

      <header class="sidebar__brand">
        <div class="sidebar__logo">
          <mat-icon>pets</mat-icon>
        </div>
        <div class="sidebar__brand-text">
          <span class="sidebar__product">AdoteJá</span>
          <span class="sidebar__tagline">Painel do Abrigo</span>
        </div>
      </header>

      <div class="sidebar__shelter">
        <div class="sidebar__avatar">{{ initials() }}</div>
        <div class="sidebar__shelter-info">
          <p class="sidebar__shelter-name">{{ shelterName() }}</p>
          <span class="sidebar__badge">
            <mat-icon>verified</mat-icon>
            Conta abrigo
          </span>
        </div>
      </div>

      <nav class="sidebar__nav">
        <p class="sidebar__section-label">Menu</p>

        <a
          routerLink="/abrigo/dashboard"
          routerLinkActive="sidebar__link--active"
          class="sidebar__link"
          (click)="navClick.emit()"
        >
          <span class="sidebar__link-icon"><mat-icon>dashboard</mat-icon></span>
          <span class="sidebar__link-text">Dashboard</span>
          <mat-icon class="sidebar__chevron">chevron_right</mat-icon>
        </a>

        <button type="button" class="sidebar__link sidebar__link--soon" disabled>
          <span class="sidebar__link-icon"><mat-icon>assignment</mat-icon></span>
          <span class="sidebar__link-text">Pedidos</span>
          <span class="sidebar__soon">Em breve</span>
        </button>

        <button type="button" class="sidebar__link sidebar__link--soon" disabled>
          <span class="sidebar__link-icon"><mat-icon>home_work</mat-icon></span>
          <span class="sidebar__link-text">Perfil</span>
          <span class="sidebar__soon">Em breve</span>
        </button>
      </nav>

      <footer class="sidebar__footer">
        <button type="button" class="sidebar__logout" (click)="logout.emit()">
          <mat-icon>logout</mat-icon>
          Sair da conta
        </button>
        <p class="sidebar__copy">AdoteJá · abrigos</p>
      </footer>

      <mat-icon class="sidebar__deco" aria-hidden="true">pets</mat-icon>
    </aside>
  `,
  styleUrl: './shelter-sidebar.component.scss',
})
export class ShelterSidebarComponent {
  private readonly auth = inject(AuthService);

  readonly open = input(false);
  readonly logout = output<void>();
  readonly navClick = output<void>();

  readonly shelterName = computed(
    () => this.auth.shelterName() || this.auth.user()?.first_name || 'Abrigo',
  );

  readonly initials = computed(() => {
    const name = this.shelterName();
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  });
}
