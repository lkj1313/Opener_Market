import type { UserRole } from './user-payload.type.js';

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}
