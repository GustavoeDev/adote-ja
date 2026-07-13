import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

import { LoginPayload, RegisterPayload, User } from '../models/user.model';
import { AuthApiService } from './auth-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal(false);
  private readonly _initialized = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly initialized = this._initialized.asReadonly();

  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);
  readonly isShelter = computed(() => this._user()?.role === 'shelter');
  readonly isAdopter = computed(() => this._user()?.role === 'adopter');
  readonly shelterName = computed(() => this._user()?.shelter_name ?? null);

  ensureCsrfCookie(): Observable<void> {
    return this.api.csrf().pipe(catchError(() => of(undefined)));
  }

  initializeSession(): Observable<User | null> {
    this._loading.set(true);
    return this.api.me().pipe(
      tap((user) => this._user.set(user)),
      catchError(() => {
        this._user.set(null);
        return of(null);
      }),
      tap(() => {
        this._loading.set(false);
        this._initialized.set(true);
      }),
    );
  }

  register(payload: RegisterPayload): Observable<void> {
    this._loading.set(true);
    return this.api.register(payload).pipe(
      map(() => undefined),
      tap(() => this._loading.set(false)),
      catchError((err) => {
        this._loading.set(false);
        return throwError(() => err);
      }),
    );
  }

  login(payload: LoginPayload): Observable<User> {
    this._loading.set(true);
    return this.api.login(payload).pipe(
      tap(({ user }) => this._user.set(user)),
      map(({ user }) => user),
      tap(() => this._loading.set(false)),
      catchError((err) => {
        this._loading.set(false);
        return throwError(() => err);
      }),
    );
  }

  logout(): Observable<void> {
    return this.api.logout().pipe(
      tap(() => this._user.set(null)),
      map(() => undefined),
      catchError((err) => {
        this._user.set(null);
        return throwError(() => err);
      }),
    );
  }

  redirectAfterLogin(): void {
    const role = this._user()?.role;
    if (role === 'shelter') {
      void this.router.navigate(['/abrigo/dashboard']);
      return;
    }
    if (role === 'adopter') {
      void this.router.navigate(['/adotante/inicio']);
      return;
    }
    void this.router.navigate(['/login']);
  }

  patchCurrentUser(partial: Partial<User>): void {
    const current = this._user();
    if (!current) return;
    this._user.set({ ...current, ...partial });
  }
}
