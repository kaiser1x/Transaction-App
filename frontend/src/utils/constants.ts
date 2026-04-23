export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_demo_placeholder'
export const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN ?? 'demo-tenant.auth0.com'
export const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID ?? 'demo-client-id'
export const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE ?? ''
