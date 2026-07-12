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
    return user.role === 'shelter'
      ? router.createUrlTree(['/abrigo/dashboard'])
      : router.createUrlTree(['/login']);
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
    return router.createUrlTree(['/login']);
  }
  return true;
};
