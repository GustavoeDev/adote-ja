import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  if (auth.initialized()) {
    return true;
  }

  return auth.initializeSession().pipe(map(() => true));
};
