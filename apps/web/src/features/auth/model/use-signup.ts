import { useMutation } from "@tanstack/react-query";
import { signup } from "../api/signup";
import type { SignupRequest } from "@opener/shared";

export function useSignup() {
  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
  });
}
