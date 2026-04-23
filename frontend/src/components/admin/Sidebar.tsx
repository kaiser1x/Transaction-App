import { BarChart3, CreditCard, LayoutDashboard, LogOut, Settings, Sparkles } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
export default function Sidebar() {
  const { logout, user } = useSession()
  const navigate = useNavigate()
  const navItems =
    user?.role === 'admin'
      ? [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/dashboard/payment-pages', label: 'Payment pages', icon: CreditCard },
          { to: '/dashboard/reports', label: 'Reporting', icon: BarChart3 },
        ]
      : [
          { to: '/dashboard/payment-options', label: 'Quick pay pages', icon: CreditCard },
          { to: '/dashboard/my-payments', label: 'Payment log', icon: BarChart3 },
        ]

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="brand-mark">
          <Sparkles size={18} aria-hidden="true" />
        </div>
        <div className="brand-copy">
          <strong>Wayspend</strong>
          <span>Provider payment platform</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary workspace">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-note stack-sm">
        <div className="badge badge-info">Connected workspace</div>
        <strong>{user?.role === 'admin' ? 'Admin workspace' : 'Payer workspace'}</strong>
        <p style={{ margin: 0 }}>
          {user?.role === 'admin'
            ? 'You have access to page management, reporting, and operational tools.'
            : 'Your account is limited to payment options and your own payment history.'}
        </p>
      </div>

      <div className="sidebar-secondary">
        <NavLink to="/verify-email" className="sidebar-link">
          <Settings size={18} aria-hidden="true" />
          <span>Session status</span>
        </NavLink>
        <button
          className="sidebar-link"
          onClick={async () => {
            await logout()
            navigate('/login')
          }}
          style={{ border: 0, background: 'transparent', width: '100%' }}
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
