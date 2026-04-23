import { api } from "./client";
import type { ApiCustomField } from "../types/api";

export interface FieldPayload {
  label: string;
  field_type: "text" | "number" | "dropdown" | "date" | "checkbox";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  helper_text?: string;
  display_order?: number;
}

export function listFields(pageId: string) {
  return api.get<ApiCustomField[]>(`/api/pages/${pageId}/fields`);
}

export function createField(pageId: string, payload: FieldPayload) {
  return api.post<{ id: string }>(`/api/pages/${pageId}/fields`, payload);
}

export function updateField(pageId: string, fieldId: string, payload: FieldPayload) {
  return api.put<{ ok: boolean }>(`/api/pages/${pageId}/fields/${fieldId}`, payload);
}

export function deleteField(pageId: string, fieldId: string) {
  return api.delete<void>(`/api/pages/${pageId}/fields/${fieldId}`);
}

export function reorderFields(pageId: string, updates: { id: string; display_order: number }[]) {
  return api.patch<{ ok: boolean }>(`/api/pages/${pageId}/fields/reorder`, updates);
}
