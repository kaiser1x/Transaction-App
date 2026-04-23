import { api } from "./client";
import type { ApiTransaction, ApiReportSummary, ApiReportByGl, ApiReportByMethod } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export interface TransactionFilters {
  pageId?: string;
  status?: string;
  from?: string;
  to?: string;
}

function buildQuery(filters: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters.pageId) params.set("pageId", filters.pageId);
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function listTransactions(filters: TransactionFilters = {}) {
  return api.get<ApiTransaction[]>(`/api/reports/transactions${buildQuery(filters)}`);
}

export function getSummary(filters: TransactionFilters = {}) {
  return api.get<ApiReportSummary>(`/api/reports/summary${buildQuery(filters)}`);
}

export function getByGl(filters: TransactionFilters = {}) {
  return api.get<ApiReportByGl[]>(`/api/reports/by-gl${buildQuery(filters)}`);
}

export function getByMethod(filters: TransactionFilters = {}) {
  return api.get<ApiReportByMethod[]>(`/api/reports/by-method${buildQuery(filters)}`);
}

export async function downloadCsv(filters: TransactionFilters = {}) {
  const qs = buildQuery(filters);
  const res = await fetch(`${BASE_URL}/api/reports/export${qs}`);
  if (!res.ok) throw new Error("CSV export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}
