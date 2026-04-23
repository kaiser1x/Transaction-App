import { useAuth0 } from '@auth0/auth0-react'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { authApi } from '../api/authApi'
import { clearTokenGetter, setTokenGetter } from '../api/client'
import type { AppUser } from '../types/auth'
import { APP_ORIGIN } from '../utils/constants'

type SessionContextValue = {
  user: AppUser | null
  loading: boolean
  login: (returnTo?: string) => Promise<void>
  signup: (returnTo?: string) => Promise<void>
  logout: () => Promise<void>
  markVerified: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

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
      const nextUser = syncedRef.current
        ? await authApi.getSession(emailVerified)
        : await authApi.sync(emailVerified)

      syncedRef.current = true
      setUser(nextUser)
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
          redirect_uri: APP_ORIGIN,
        },
      })
    },
    async signup(returnTo = '/dashboard') {
      await loginWithRedirect({
        appState: { returnTo },
        authorizationParams: {
          redirect_uri: APP_ORIGIN,
          screen_hint: 'signup',
        },
      })
    },
    async logout() {
      clearTokenGetter()
      syncedRef.current = false
      setUser(null)
      await auth0Logout({ logoutParams: { returnTo: APP_ORIGIN } })
    },
    async markVerified() {
      const refreshed = await authApi.getSession(Boolean(auth0User?.email_verified))
      setUser(refreshed)
    },
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside SessionProvider')
  return context
}
