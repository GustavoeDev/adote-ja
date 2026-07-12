export type AnimalStatus = 'available' | 'in_process' | 'adopted';
export type AnimalSpecies = 'dog' | 'cat' | 'rabbit' | 'other';
export type AnimalSize = 'small' | 'medium' | 'large';

export interface Animal {
  id: number;
  name: string;
  species: AnimalSpecies;
  breed: string;
  age_text: string;
  weight: string;
  size: AnimalSize | '';
  status: AnimalStatus;
  cover_photo_url: string | null;
  shelter_name: string;
  city: string;
  is_active: boolean;
}

export interface ShelterDashboard {
  shelter_name: string;
  total_animals: number;
  available: number;
  in_process: number;
  requests_count: number;
}
