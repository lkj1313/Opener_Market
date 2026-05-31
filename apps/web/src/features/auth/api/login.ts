import { api } from "@/shared/api";
import type { LoginRequest, User } from "@opener/shared";

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/login", data);
}
