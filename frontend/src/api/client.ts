import { API_BASE_URL } from '../utils/constants'

let tokenGetter: (() => Promise<string>) | null = null

export function setTokenGetter(fn: () => Promise<string>) {
  tokenGetter = fn
}

export function clearTokenGetter() {
  tokenGetter = null
}

async function buildHeaders(init: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(init.headers as Record<string, string>),
  }

  if (tokenGetter) {
    const token = await tokenGetter()
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function fetchWithAuth(path: string, init: RequestInit = {}) {
  const headers = await buildHeaders(init)
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers })
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetchWithAuth(path, init)

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((body as { error?: string }).error ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
