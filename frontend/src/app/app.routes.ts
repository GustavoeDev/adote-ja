import { Routes } from '@angular/router';

import { authGuard, guestGuard, shelterGuard } from './core/auth/auth.guard';

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
    ],
  },
  { path: '**', redirectTo: 'login' },
];
