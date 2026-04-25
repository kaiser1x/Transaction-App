import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import type { AppUserRole } from '../types/auth'
import { workspaceHomeRoute } from '../utils/routeHelpers'
import { REQUIRE_VERIFIED_ADMIN } from '../utils/constants'

export default function RoleRoute({ allowedRole }: { allowedRole: AppUserRole }) {
  const { user } = useSession()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== allowedRole) return <Navigate to={workspaceHomeRoute(user.role)} replace />
  if (allowedRole === 'admin' && REQUIRE_VERIFIED_ADMIN && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return <Outlet />
}
