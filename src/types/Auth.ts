import type { UserRole } from './User';

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
}