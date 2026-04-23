import { CreditCard, LayoutDashboard, ShieldCheck, Workflow } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const features = [
  {
    title: 'Reusable payment pages',
    description: 'Spin up branded pages for statements, deposits, and open balance collection.',
    icon: LayoutDashboard,
  },
  {
    title: 'Stripe-ready intake',
    description: 'Keep the UI ready for Payment Element insertion without storing card data locally.',
    icon: CreditCard,
  },
  {
    title: 'Trust-first payer flow',
    description: 'Clear guidance, healthcare-safe language, and accessibility built into every step.',
    icon: ShieldCheck,
  },
  {
    title: 'Reporting and routing',
    description: 'Monitor transactions, GL codes, and page performance in one workspace.',
    icon: Workflow,
  },
]

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <main className="auth-panel">
        <Outlet />
      </main>
      <aside className="auth-aside">
        <div className="stack-md">
          <div className="brand-copy">
            <strong>Wayspend</strong>
            <span>Healthcare payments for modern provider teams</span>
          </div>
          <h2 style={{ margin: 0, color: 'var(--cream-50)', fontSize: '2.2rem' }}>
            The fastest way to launch a polished payment workspace that still feels enterprise-ready.
          </h2>
          <p className="muted-text" style={{ color: 'rgba(244, 236, 221, 0.76)' }}>
            Structured for Auth0, Stripe test mode, backend API handoff, and live page distribution.
          </p>
        </div>
        <div className="auth-feature-grid">
          {features.map(({ title, description, icon: Icon }) => (
            <div key={title} className="auth-feature-card">
              <Icon size={18} />
              <h3>{title}</h3>
              <p className="muted-text" style={{ color: 'rgba(244, 236, 221, 0.76)' }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
