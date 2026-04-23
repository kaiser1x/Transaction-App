import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import Auth0ProviderWithNavigate from './context/Auth0ProviderWithNavigate'
import { SessionProvider } from './context/SessionContext'
import './styles/tokens.css'
import './styles/globals.css'
import './styles/utilities.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <SessionProvider>
          <App />
        </SessionProvider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
)
