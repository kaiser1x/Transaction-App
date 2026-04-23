import { api } from "./client";
import type { ApiPaymentPage } from "../types/api";

export interface PagePayload {
  slug: string;
  title: string;
  description?: string;
  header_msg?: string;
  footer_msg?: string;
  brand_color?: string;
  logo_url?: string;
  amount_mode: "fixed" | "min_max" | "user_entered";
  fixed_amount?: number;
  min_amount?: number;
  max_amount?: number;
  gl_codes?: string[];
  email_template?: string;
}

export function listPages() {
  return api.get<ApiPaymentPage[]>("/api/pages");
}

export function listAvailablePages() {
  return api.get<ApiPaymentPage[]>("/api/pages/available");
}

export function getPageBySlug(slug: string) {
  return api.get<ApiPaymentPage>(`/api/pages/${slug}`);
}

export function createPage(payload: PagePayload) {
  return api.post<ApiPaymentPage>("/api/pages", payload);
}

export function updatePage(id: string, payload: PagePayload) {
  return api.put<ApiPaymentPage>(`/api/pages/${id}`, payload);
}

export function togglePage(id: string) {
  return api.patch<ApiPaymentPage>(`/api/pages/${id}/toggle`);
}

export function deletePage(id: string) {
  return api.delete<void>(`/api/pages/${id}`);
}
