import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdoptionRequest } from '../models/adoption.model';
import {
  AdopterProfile,
  AdopterProfileUpdatePayload,
  CreateAdoptionRequestPayload,
  DiscoverAnimal,
  DiscoverAnimalDetail,
  DiscoverAnimalsQuery,
  PublicShelter,
} from '../models/adopter.model';

@Injectable({ providedIn: 'root' })
export class AdopterApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listAnimals(query: DiscoverAnimalsQuery = {}): Observable<DiscoverAnimal[]> {
    let params = new HttpParams();
    if (query.species) params = params.set('species', query.species);
    if (query.q) params = params.set('q', query.q);
    if (query.city) params = params.set('city', query.city);
    return this.http.get<DiscoverAnimal[]>(`${this.apiUrl}/discover/animals/`, { params });
  }

  getAnimal(id: number): Observable<DiscoverAnimalDetail> {
    return this.http.get<DiscoverAnimalDetail>(`${this.apiUrl}/discover/animals/${id}/`);
  }

  getShelter(id: number): Observable<PublicShelter> {
    return this.http.get<PublicShelter>(`${this.apiUrl}/discover/shelters/${id}/`);
  }

  getProfile(): Observable<AdopterProfile> {
    return this.http.get<AdopterProfile>(`${this.apiUrl}/adopter/profile/`);
  }

  updateProfile(payload: AdopterProfileUpdatePayload): Observable<AdopterProfile> {
    return this.http.patch<AdopterProfile>(`${this.apiUrl}/adopter/profile/`, payload);
  }

  deleteAccount(password: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/adopter/account/`, {
      body: { password },
    });
  }

  listRequests(): Observable<AdoptionRequest[]> {
    return this.http.get<AdoptionRequest[]>(`${this.apiUrl}/adopter/requests/`);
  }

  getRequest(id: number): Observable<AdoptionRequest> {
    return this.http.get<AdoptionRequest>(`${this.apiUrl}/adopter/requests/${id}/`);
  }

  createRequest(payload: CreateAdoptionRequestPayload): Observable<AdoptionRequest> {
    return this.http.post<AdoptionRequest>(`${this.apiUrl}/adopter/requests/`, payload);
  }
}
