import { api } from './client'
import type { AppUser } from '../types/auth'

type ApiUser = {
  id: string
  auth0_id?: string
  email: string
  name: string | null
  role: 'admin' | 'payer'
}

type SyncPayload = {
  email?: string
  name?: string
}

function mapUser(user: ApiUser, emailVerified?: boolean): AppUser {
  return {
    id: user.id,
    auth0Id: user.auth0_id,
    email: user.email ?? '',
    name: user.name ?? undefined,
    role: user.role,
    emailVerified,
  }
}

export const authApi = {
  async sync(payload: SyncPayload = {}, emailVerified?: boolean) {
    const user = await api.post<ApiUser>('/api/auth/sync', payload)
    return mapUser(user, emailVerified)
  },
  async getSession(emailVerified?: boolean) {
    const user = await api.get<ApiUser>('/api/auth/me')
    return mapUser(user, emailVerified)
  },
}
