import { api } from "@/shared/api";
import type { SignupRequest, User } from "@opener/shared";

export async function signup(data: SignupRequest): Promise<User> {
  return api.post<User>("/auth/signup", data);
}
