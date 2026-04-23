import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import type { AppUserRole } from '../types/auth'

export default function RoleRoute({ allowedRole }: { allowedRole: AppUserRole }) {
  const { user } = useSession()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== allowedRole) return <Navigate to="/dashboard" replace />
  if (allowedRole === 'admin' && !user.emailVerified) return <Navigate to="/verify-email" replace />

  return <Outlet />
}
