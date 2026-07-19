import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  register(payload: RegisterPayload): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${this.baseUrl}/register/`, payload);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login/`, payload);
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/logout/`, {});
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me/`);
  }

  csrf(): Observable<void> {
    return this.http.get<{ detail: string }>(`${this.baseUrl}/csrf/`).pipe(
      map(() => undefined),
    );
  }
}
