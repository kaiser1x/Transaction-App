import { api, fetchWithAuth } from './client'
import type { ApiReportByGl, ApiReportByMethod, ApiReportSummary, ApiTransaction } from '../types/api'

export interface TransactionFilters {
  pageId?: string
  status?: string
  startDate?: string
  endDate?: string
}

function buildQuery(filters: TransactionFilters) {
  const params = new URLSearchParams()
  if (filters.pageId) params.set('pageId', filters.pageId)
  if (filters.status) params.set('status', filters.status)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function listTransactions(filters: TransactionFilters = {}) {
  return api.get<ApiTransaction[]>(`/api/reports/transactions${buildQuery(filters)}`)
}

export function getSummary(filters: TransactionFilters = {}) {
  return api.get<ApiReportSummary>(`/api/reports/summary${buildQuery(filters)}`)
}

export function getByGl(filters: TransactionFilters = {}) {
  return api.get<ApiReportByGl[]>(`/api/reports/by-gl${buildQuery(filters)}`)
}

export function getByMethod(filters: TransactionFilters = {}) {
  return api.get<ApiReportByMethod[]>(`/api/reports/by-method${buildQuery(filters)}`)
}

export async function downloadCsv(filters: TransactionFilters = {}) {
  const qs = buildQuery(filters)
  const res = await fetchWithAuth(`/api/reports/export${qs}`)
  if (!res.ok) throw new Error('CSV export failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'transactions.csv'
  a.click()
  URL.revokeObjectURL(url)
}
