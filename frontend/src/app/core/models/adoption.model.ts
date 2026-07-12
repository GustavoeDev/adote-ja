export type AdoptionRequestStatus = 'pending' | 'approved' | 'rejected';
export type TimelineStepStatus = 'done' | 'current' | 'pending';

export interface TimelineEvent {
  event: string;
  date_text: string;
  status: TimelineStepStatus;
  order: number;
}

export interface AdoptionRequest {
  id: number;
  animal_id: number;
  animal_name: string;
  animal_photo_url: string | null;
  status: AdoptionRequestStatus;
  date: string;
  adopter_name: string;
  adopter_phone: string;
  adopter_email: string;
  adopter_city: string;
  message: string;
  timeline: TimelineEvent[];
  created_at: string;
  reviewed_at: string | null;
}
