import { api } from "./client";

export interface MeResponse {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "payer";
}

export function syncUser(email: string, name: string | null) {
  return api.post<MeResponse>("/api/auth/sync", { email, name });
}

export function getMe() {
  return api.get<MeResponse>("/api/auth/me");
}
