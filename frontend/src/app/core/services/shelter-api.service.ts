import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Animal, ShelterDashboard } from '../models/animal.model';

@Injectable({ providedIn: 'root' })
export class ShelterApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getDashboard(): Observable<ShelterDashboard> {
    return this.http.get<ShelterDashboard>(`${this.apiUrl}/shelter/dashboard/`);
  }

  listAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/animals/`);
  }

  inactivateAnimal(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/animals/${id}/inactivate/`, {});
  }
}
