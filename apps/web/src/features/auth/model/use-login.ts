import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@opener/shared";
import { login } from "../api/login";
import type { LoginRequest } from "@opener/shared";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (res) => {
      useAuthStore.getState().login(res.accessToken, res.user);
    },
  });
}
