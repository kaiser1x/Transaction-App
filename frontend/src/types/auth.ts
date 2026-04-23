export type AppUserRole = 'admin' | 'payer'

export type AppUser = {
  id: string
  email: string
  name?: string
  role: AppUserRole
  emailVerified?: boolean
  auth0Id?: string
}
