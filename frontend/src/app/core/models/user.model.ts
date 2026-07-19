export type UserRole = 'adopter' | 'shelter';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  role: UserRole;
  phone: string;
  shelter_name: string | null;
}

export interface RegisterPayload {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
