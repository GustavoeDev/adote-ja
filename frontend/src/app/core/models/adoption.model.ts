export type AdoptionRequestStatus = 'pending' | 'in_progress' | 'approved' | 'rejected';
export type InterviewPhase = 'to_schedule' | 'scheduled' | 'to_perform' | 'done';
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
  interview_phase: InterviewPhase;
  interview_completed: boolean;
  data_reviewed: boolean;
  can_review_data: boolean;
  can_decide: boolean;
  whatsapp_url: string | null;
  date: string;
  adopter_name: string;
  adopter_phone: string;
  adopter_email: string;
  adopter_city: string;
  adopter_cpf?: string;
  adopter_address?: string;
  housing_type?: string;
  has_yard?: string;
  other_pets?: string;
  motivation?: string;
  experience?: string;
  hours_alone?: string;
  message: string;
  rejection_reason: string;
  timeline: TimelineEvent[];
  created_at: string;
  data_reviewed_at?: string | null;
  reviewed_at: string | null;
}
