import { Bell, CircleHelp } from 'lucide-react'
import Badge from '../common/Badge'
import SearchBar from '../common/SearchBar'
import { useSession } from '../../context/SessionContext'
import { REQUIRE_VERIFIED_ADMIN } from '../../utils/constants'

export default function Topbar() {
  const { user } = useSession()
  const searchPlaceholder =
    user?.role === 'admin' ? 'Search pages, payers, or GL codes' : 'Search quick payment pages or your recent activity'
  const verificationBypassed = user?.role === 'admin' && !user?.emailVerified && !REQUIRE_VERIFIED_ADMIN
  const verificationTone = user?.emailVerified || verificationBypassed ? 'success' : 'warning'
  const verificationLabel = user?.emailVerified
    ? 'Verified user'
    : verificationBypassed
      ? 'Verification bypass'
      : 'Needs verification'

  return (
    <header className="topbar">
      <div className="topbar-group">
        <SearchBar placeholder={searchPlaceholder} aria-label="Search the Wayspend workspace" />
      </div>
      <div className="topbar-actions">
        <Badge tone={verificationTone}>{verificationLabel}</Badge>
        <button className="button button-ghost" aria-label="Notifications">
          <Bell size={18} aria-hidden="true" />
        </button>
        <button className="button button-ghost" aria-label="Help">
          <CircleHelp size={18} aria-hidden="true" />
        </button>
        <div className="badge badge-neutral">{user?.name ?? 'Wayspend user'}</div>
      </div>
    </header>
  )
}
