export type AnimalStatus = 'available' | 'in_process' | 'adopted';
export type AnimalSpecies = 'dog' | 'cat' | 'other';
export type AnimalSize = 'small' | 'medium' | 'large';
export type AnimalSex = 'male' | 'female';
export type MediaType = 'photo' | 'video';

export interface AnimalMedia {
  id: number;
  file_url: string;
  media_type: MediaType;
  is_cover: boolean;
  order: number;
}

export interface Animal {
  id: number;
  name: string;
  species: AnimalSpecies;
  breed: string;
  sex: AnimalSex | '';
  age_text: string;
  weight: string;
  size: AnimalSize | '';
  status: AnimalStatus;
  cover_photo_url: string | null;
  shelter_name: string;
  city: string;
  is_active: boolean;
}

export interface AnimalDetail extends Animal {
  age_months: number | null;
  description: string;
  vaccinated: boolean;
  neutered: boolean;
  media: AnimalMedia[];
  created_at: string;
  updated_at: string;
}

export interface AnimalWritePayload {
  name: string;
  species: AnimalSpecies;
  breed?: string;
  sex?: AnimalSex | '';
  age_text?: string;
  age_months?: number | null;
  weight?: string;
  size?: AnimalSize | '';
  description?: string;
  vaccinated?: boolean;
  neutered?: boolean;
  city?: string;
  status?: AnimalStatus;
}

export interface ShelterDashboard {
  shelter_name: string;
  total_animals: number;
  available: number;
  in_process: number;
  requests_count: number;
}

export interface ShelterProfile {
  id: number;
  name: string;
  cover_photo_url: string | null;
  profile_photo_url: string | null;
  about: string;
  public_email: string;
  public_phone: string;
  website: string;
  city: string;
  is_verified: boolean;
  initials: string;
}

export interface ShelterProfileUpdatePayload {
  name?: string;
  about?: string;
  public_email?: string;
  public_phone?: string;
  website?: string;
  city?: string;
}

export interface PendingMediaFile {
  id: string;
  file: File;
  previewUrl: string;
  mediaType: MediaType;
}
