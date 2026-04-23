import { Auth0Provider } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_ORIGIN, AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../utils/constants'

type RedirectAppState = {
  returnTo?: string
}

export default function Auth0ProviderWithNavigate({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: APP_ORIGIN,
        audience: AUTH0_AUDIENCE || undefined,
      }}
      onRedirectCallback={(appState?: RedirectAppState) => {
        navigate(appState?.returnTo ?? '/dashboard', { replace: true })
      }}
    >
      {children}
    </Auth0Provider>
  )
}
