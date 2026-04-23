import { Bell, CircleHelp } from 'lucide-react'
import Badge from '../common/Badge'
import SearchBar from '../common/SearchBar'
import { useSession } from '../../context/SessionContext'

export default function Topbar() {
  const { user } = useSession()
  const searchPlaceholder =
    user?.role === 'admin' ? 'Search pages, payers, or GL codes' : 'Search quick payment pages or your recent activity'

  return (
    <header className="topbar">
      <div className="topbar-group">
        <SearchBar placeholder={searchPlaceholder} aria-label="Search the Wayspend workspace" />
      </div>
      <div className="topbar-actions">
        <Badge tone={user?.emailVerified ? 'success' : 'warning'}>
          {user?.emailVerified ? 'Verified user' : 'Needs verification'}
        </Badge>
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
