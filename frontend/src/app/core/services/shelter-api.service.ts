import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdoptionRequest, AdoptionRequestStatus } from '../models/adoption.model';
import {
  Animal,
  AnimalDetail,
  AnimalWritePayload,
  ShelterDashboard,
  ShelterProfile,
  ShelterProfileUpdatePayload,
} from '../models/animal.model';

@Injectable({ providedIn: 'root' })
export class ShelterApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getDashboard(): Observable<ShelterDashboard> {
    return this.http.get<ShelterDashboard>(`${this.apiUrl}/shelter/dashboard/`);
  }

  getProfile(): Observable<ShelterProfile> {
    return this.http.get<ShelterProfile>(`${this.apiUrl}/shelter/profile/`);
  }

  updateProfile(payload: ShelterProfileUpdatePayload): Observable<ShelterProfile> {
    return this.http.patch<ShelterProfile>(`${this.apiUrl}/shelter/profile/`, payload);
  }

  uploadCover(file: File): Observable<ShelterProfile> {
    const formData = new FormData();
    formData.append('cover_photo', file);
    return this.http.post<ShelterProfile>(`${this.apiUrl}/shelter/profile/cover/`, formData);
  }

  uploadAvatar(file: File): Observable<ShelterProfile> {
    const formData = new FormData();
    formData.append('profile_photo', file);
    return this.http.post<ShelterProfile>(`${this.apiUrl}/shelter/profile/avatar/`, formData);
  }

  listAnimals(species?: string): Observable<Animal[]> {
    const params = species ? `?species=${species}` : '';
    return this.http.get<Animal[]>(`${this.apiUrl}/animals/${params}`);
  }

  getAnimal(id: number): Observable<AnimalDetail> {
    return this.http.get<AnimalDetail>(`${this.apiUrl}/animals/${id}/`);
  }

  createAnimal(payload: AnimalWritePayload): Observable<AnimalDetail> {
    return this.http.post<AnimalDetail>(`${this.apiUrl}/animals/`, payload);
  }

  updateAnimal(id: number, payload: Partial<AnimalWritePayload>): Observable<AnimalDetail> {
    return this.http.patch<AnimalDetail>(`${this.apiUrl}/animals/${id}/`, payload);
  }

  inactivateAnimal(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/animals/${id}/inactivate/`, {});
  }

  uploadMedia(animalId: number, files: File[]): Observable<AnimalDetail> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<AnimalDetail>(`${this.apiUrl}/animals/${animalId}/media/`, formData);
  }

  deleteMedia(animalId: number, mediaId: number): Observable<AnimalDetail> {
    return this.http.delete<AnimalDetail>(`${this.apiUrl}/animals/${animalId}/media/${mediaId}/`);
  }

  setCover(animalId: number, mediaId: number): Observable<AnimalDetail> {
    return this.http.post<AnimalDetail>(
      `${this.apiUrl}/animals/${animalId}/media/${mediaId}/cover/`,
      {},
    );
  }

  listRequests(status?: AdoptionRequestStatus): Observable<AdoptionRequest[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<AdoptionRequest[]>(`${this.apiUrl}/shelter/requests/${params}`);
  }

  getRequest(id: number): Observable<AdoptionRequest> {
    return this.http.get<AdoptionRequest>(`${this.apiUrl}/shelter/requests/${id}/`);
  }

  scheduleInterview(id: number): Observable<AdoptionRequest> {
    return this.http.post<AdoptionRequest>(
      `${this.apiUrl}/shelter/requests/${id}/schedule-interview/`,
      {},
    );
  }

  startInterview(id: number): Observable<AdoptionRequest> {
    return this.http.post<AdoptionRequest>(
      `${this.apiUrl}/shelter/requests/${id}/start-interview/`,
      {},
    );
  }

  completeInterview(id: number): Observable<AdoptionRequest> {
    return this.http.post<AdoptionRequest>(
      `${this.apiUrl}/shelter/requests/${id}/complete-interview/`,
      {},
    );
  }

  approveRequest(id: number): Observable<AdoptionRequest> {
    return this.http.post<AdoptionRequest>(`${this.apiUrl}/shelter/requests/${id}/approve/`, {});
  }

  rejectRequest(id: number, reason: string): Observable<AdoptionRequest> {
    return this.http.post<AdoptionRequest>(`${this.apiUrl}/shelter/requests/${id}/reject/`, {
      reason,
    });
  }
}
