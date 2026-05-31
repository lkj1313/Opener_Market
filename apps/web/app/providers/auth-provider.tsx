"use client";

import { useEffect } from "react";
import { useAuthStore, type User } from "@opener/shared";
import { api } from "@/shared/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    api
      .get<User>("/users/me")
      .then((user) => {
        useAuthStore.getState().login(token, user);
      })
      .catch(() => {
        useAuthStore.getState().logout();
      });
  }, []);

  return <>{children}</>;
}
