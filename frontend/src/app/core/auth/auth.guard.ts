import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.initialized()) {
    if (auth.isAuthenticated()) return true;
    return router.createUrlTree(['/login']);
  }

  return auth.initializeSession().pipe(
    map((user) => (user ? true : router.createUrlTree(['/login']))),
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const redirectIfLoggedIn = () => {
    const user = auth.user();
    if (!user) return true;
    if (user.role === 'shelter') {
      return router.createUrlTree(['/abrigo/dashboard']);
    }
    if (user.role === 'adopter') {
      return router.createUrlTree(['/adotante/inicio']);
    }
    return router.createUrlTree(['/login']);
  };

  if (auth.initialized()) {
    return redirectIfLoggedIn();
  }

  return auth.initializeSession().pipe(map(() => redirectIfLoggedIn()));
};

export const shelterGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  if (auth.role() !== 'shelter') {
    return auth.role() === 'adopter'
      ? router.createUrlTree(['/adotante/inicio'])
      : router.createUrlTree(['/login']);
  }
  return true;
};

export const adopterGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  if (auth.role() !== 'adopter') {
    return auth.role() === 'shelter'
      ? router.createUrlTree(['/abrigo/dashboard'])
      : router.createUrlTree(['/login']);
  }
  return true;
};
