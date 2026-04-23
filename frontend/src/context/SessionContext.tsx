import { useAuth0 } from '@auth0/auth0-react'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { authApi } from '../api/authApi'
import { clearTokenGetter, setTokenGetter } from '../api/client'
import type { AppUser } from '../types/auth'


type SessionContextValue = {
  user: AppUser | null
  loading: boolean
  login: (returnTo?: string) => Promise<void>
  signup: (returnTo?: string) => Promise<void>
  logout: () => Promise<void>
  markVerified: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

function normalizeName(name?: string, email?: string) {
  const trimmedName = name?.trim()
  const trimmedEmail = email?.trim().toLowerCase()

  if (!trimmedName) return undefined
  if (trimmedEmail && trimmedName.toLowerCase() === trimmedEmail) return undefined

  return trimmedName
}

function mergeAuth0Profile(user: AppUser, auth0User?: { email?: string; name?: string; email_verified?: boolean }) {
  const email = user.email || auth0User?.email || ''

  return {
    ...user,
    email,
    name: normalizeName(user.name, email) ?? normalizeName(auth0User?.name, email),
    emailVerified: user.emailVerified ?? auth0User?.email_verified,
  } satisfies AppUser
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const syncedRef = useRef(false)
  const {
    isAuthenticated,
    isLoading,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      clearTokenGetter()
      syncedRef.current = false
      setUser(null)
      setLoading(false)
      return
    }

    setTokenGetter(() => getAccessTokenSilently())

    void (async () => {
      const emailVerified = Boolean(auth0User?.email_verified)
      const profile = {
        email: auth0User?.email,
        name: auth0User?.name,
      }
      const nextUser = syncedRef.current
        ? await authApi.getSession(emailVerified)
        : await authApi.sync(profile, emailVerified)

      syncedRef.current = true
      setUser(mergeAuth0Profile(nextUser, auth0User))
      setLoading(false)
    })()
  }, [auth0User?.email_verified, getAccessTokenSilently, isAuthenticated, isLoading])

  const value: SessionContextValue = {
    user,
    loading,
    async login(returnTo = '/dashboard') {
      await loginWithRedirect({
        appState: { returnTo },
        authorizationParams: {
          redirect_uri: globalThis.location.origin,
        },
      })
    },
    async signup(returnTo = '/dashboard') {
      await loginWithRedirect({
        appState: { returnTo },
        authorizationParams: {
          redirect_uri: globalThis.location.origin,
          screen_hint: 'signup',
        },
      })
    },
    async logout() {
      clearTokenGetter()
      syncedRef.current = false
      setUser(null)
      await auth0Logout({ logoutParams: { returnTo: globalThis.location.origin } })
    },
    async markVerified() {
      const refreshed = await authApi.getSession(Boolean(auth0User?.email_verified))
      setUser(mergeAuth0Profile(refreshed, auth0User))
    },
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside SessionProvider')
  return context
}
