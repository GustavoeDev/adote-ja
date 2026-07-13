import { Animal, AnimalDetail, AnimalMedia, AnimalStatus } from './animal.model';
import { AdoptionRequest } from './adoption.model';

export interface DiscoverAnimal extends Animal {
  age_months: number | null;
}

export interface DiscoverAnimalDetail extends AnimalDetail {
  shelter_id: number;
  has_active_request: boolean;
  media: AnimalMedia[];
}

export interface PublicShelter {
  id: number;
  name: string;
  about: string;
  public_email: string;
  public_phone: string;
  website: string;
  city: string;
  is_verified: boolean;
  cover_photo_url: string | null;
  profile_photo_url: string | null;
  initials: string;
  animals: DiscoverAnimal[];
}

export interface AdopterProfile {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthdate: string;
  address: string;
  city: string;
  housing_type: string;
  has_yard: string;
  has_screens: string;
  other_pets: string;
  hours_alone: string;
  preferences: string[];
  initials: string;
}

export interface AdopterProfileUpdatePayload {
  name?: string;
  phone?: string;
  cpf?: string;
  birthdate?: string;
  address?: string;
  city?: string;
  housing_type?: string;
  has_yard?: string;
  has_screens?: string;
  other_pets?: string;
  hours_alone?: string;
  preferences?: string[];
}

export interface CreateAdoptionRequestPayload {
  animal_id: number;
  adopter_name: string;
  adopter_cpf: string;
  adopter_phone?: string;
  adopter_email: string;
  adopter_address?: string;
  adopter_city?: string;
  housing_type?: string;
  has_yard?: string;
  other_pets?: string;
  motivation?: string;
  experience?: string;
  hours_alone?: string;
  message?: string;
}

export interface DiscoverAnimalsQuery {
  species?: string;
  q?: string;
  city?: string;
}

export type { AdoptionRequest, AnimalStatus };
