import { createHttpClient } from "@opener/shared";

export const api = createHttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  getToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  },
});
