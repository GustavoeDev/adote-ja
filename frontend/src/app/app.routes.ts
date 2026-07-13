import { Routes } from '@angular/router';

import { adopterGuard, authGuard, guestGuard, shelterGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'abrigo',
    canActivate: [authGuard, shelterGuard],
    loadComponent: () =>
      import('./layouts/shelter-layout/shelter-layout.component').then((m) => m.ShelterLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/shelter/dashboard/shelter-dashboard.component').then(
            (m) => m.ShelterDashboardComponent,
          ),
      },
      {
        path: 'animais',
        loadComponent: () =>
          import('./features/shelter/animals-list/animals-list.component').then(
            (m) => m.AnimalsListComponent,
          ),
      },
      {
        path: 'animais/novo',
        loadComponent: () =>
          import('./features/shelter/animal-form/animal-form.component').then(
            (m) => m.AnimalFormComponent,
          ),
      },
      {
        path: 'animais/:id/editar',
        loadComponent: () =>
          import('./features/shelter/animal-form/animal-form.component').then(
            (m) => m.AnimalFormComponent,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/shelter/profile/shelter-profile.component').then(
            (m) => m.ShelterProfileComponent,
          ),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/shelter/requests/shelter-requests.component').then(
            (m) => m.ShelterRequestsComponent,
          ),
      },
    ],
  },
  {
    path: 'adotante',
    canActivate: [authGuard, adopterGuard],
    loadComponent: () =>
      import('./layouts/adopter-layout/adopter-layout.component').then((m) => m.AdopterLayoutComponent),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/adopter/home/adopter-home.component').then((m) => m.AdopterHomeComponent),
      },
      {
        path: 'animais/:id',
        loadComponent: () =>
          import('./features/adopter/animal-detail/animal-detail.component').then(
            (m) => m.AnimalDetailComponent,
          ),
      },
      {
        path: 'animais/:id/adotar',
        loadComponent: () =>
          import('./features/adopter/adoption-form/adoption-form.component').then(
            (m) => m.AdoptionFormComponent,
          ),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/adopter/requests/adopter-requests.component').then(
            (m) => m.AdopterRequestsComponent,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/adopter/profile/adopter-profile.component').then(
            (m) => m.AdopterProfileComponent,
          ),
      },
      {
        path: 'abrigos/:id',
        loadComponent: () =>
          import('./features/adopter/shelter-public/shelter-public.component').then(
            (m) => m.ShelterPublicComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
