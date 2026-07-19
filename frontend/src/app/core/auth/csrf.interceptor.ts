import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';

import { AuthService } from './auth.service';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next(req);
  }

  const send = (token: string | null) => {
    const headers = token ? req.clone({ setHeaders: { 'X-CSRFToken': token } }) : req;
    return next(headers);
  };

  const existing = getCookie('csrftoken');
  if (existing) {
    return send(existing);
  }

  return auth.ensureCsrfCookie().pipe(switchMap(() => send(getCookie('csrftoken'))));
};
