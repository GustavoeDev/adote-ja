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
  can_decide: boolean;
  whatsapp_url: string | null;
  date: string;
  adopter_name: string;
  adopter_phone: string;
  adopter_email: string;
  adopter_city: string;
  message: string;
  rejection_reason: string;
  timeline: TimelineEvent[];
  created_at: string;
  reviewed_at: string | null;
}
