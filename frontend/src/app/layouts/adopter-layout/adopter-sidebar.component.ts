import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-adopter-sidebar',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.sidebar--open]="open()" aria-label="Menu do adotante">
      <header class="sidebar__brand">
        <div class="sidebar__logo">
          <mat-icon>pets</mat-icon>
        </div>
        <div class="sidebar__brand-text">
          <span class="sidebar__product">AdoteJá</span>
          <span class="sidebar__tagline">Área do Adotante</span>
        </div>
      </header>

      <nav class="sidebar__nav">
        <p class="sidebar__section-label">Menu</p>
        <a
          routerLink="/adotante/inicio"
          routerLinkActive="sidebar__link--active"
          class="sidebar__link"
          (click)="navClick.emit()"
        >
          <span class="sidebar__link-icon"><mat-icon>home</mat-icon></span>
          <span class="sidebar__link-text">Início</span>
        </a>
        <a
          routerLink="/adotante/pedidos"
          routerLinkActive="sidebar__link--active"
          class="sidebar__link"
          (click)="navClick.emit()"
        >
          <span class="sidebar__link-icon"><mat-icon>assignment</mat-icon></span>
          <span class="sidebar__link-text">Pedidos</span>
        </a>
        <a
          routerLink="/adotante/perfil"
          routerLinkActive="sidebar__link--active"
          class="sidebar__link"
          (click)="navClick.emit()"
        >
          <span class="sidebar__link-icon"><mat-icon>person</mat-icon></span>
          <span class="sidebar__link-text">Perfil</span>
        </a>
      </nav>

      <footer class="sidebar__footer">
        <button type="button" class="sidebar__logout" (click)="logout.emit()">
          <mat-icon>logout</mat-icon>
          Sair da conta
        </button>
      </footer>
    </aside>
  `,
  styleUrl: './adopter-sidebar.component.scss',
})
export class AdopterSidebarComponent {
  readonly open = input(false);
  readonly logout = output<void>();
  readonly navClick = output<void>();
}
