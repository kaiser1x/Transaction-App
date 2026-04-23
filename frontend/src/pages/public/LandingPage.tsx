import { ArrowRight, CreditCard, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useSession } from '../../context/SessionContext'
import { workspaceHomeRoute } from '../../utils/routeHelpers'

const features = [
  {
    title: 'Provider admin controls',
    copy: 'Authenticate once, manage branded payment pages, and keep reporting inside a secure admin portal.',
    icon: LayoutDashboard,
  },
  {
    title: 'Reusable quick payment pages',
    copy: 'Create persistent public URLs for balances, deposits, donations, and service payments with configurable amounts and custom fields.',
    icon: CreditCard,
  },
  {
    title: 'Trust-first payer experience',
    copy: 'Guide payers through an accessible, Stripe-backed payment flow that feels calm, clear, and ready for a live walkthrough.',
    icon: ShieldCheck,
  },
]

export default function LandingPage() {
  const { user } = useSession()

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <span className="brand-mark">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <span className="brand-copy">
            <strong>Wayspend</strong>
            <span>Provider payment platform</span>
          </span>
        </Link>
        <nav className="landing-links" aria-label="Primary">
          <a href="#platform">Platform</a>
          <a href="#demo-flow">Demo flow</a>
          <a href="#accessibility">Accessibility</a>
        </nav>
        <div className="landing-actions">
          <Link to={user ? workspaceHomeRoute(user.role) : '/login'} className="landing-login-link">
            {user ? 'Workspace' : 'Login'}
          </Link>
          <Link to="/signup">
            <Button>
              Open demo
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy stack-lg">
          <h1>
            Branded quick payments
            <br />
            that feel <span>clear and trusted.</span>
          </h1>
          <p>
            Configure payment pages in the admin portal, share them by URL, iframe, or QR code, and complete secure
            Stripe sandbox transactions through a public payer experience.
          </p>
          <div className="action-row">
            <Link to={user ? workspaceHomeRoute(user.role) : '/signup'}>
              <Button>
                {user ? 'Open workspace' : 'Start demo'}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/login" className="landing-secondary-link">
              Login
            </Link>
          </div>
        </div>
        <div className="landing-art" aria-hidden="true">
          <div className="landing-demo-card">
            <div className="landing-demo-top">
              <span className="landing-demo-pill">Public payment page</span>
              <span className="landing-demo-status">Stripe sandbox</span>
            </div>
            <div className="landing-demo-stack">
              <div className="landing-demo-provider">
                <strong>Northstar Family Medicine</strong>
                <span>Nashville, TN</span>
              </div>
              <div className="landing-demo-amount">
                <span>Amount due</span>
                <strong>$168.30</strong>
              </div>
              <div className="landing-demo-steps">
                <span className="active">1. Bill</span>
                <span>2. Card</span>
                <span>3. Receipt</span>
              </div>
              <div className="landing-demo-lines">
                <span className="long" />
                <span />
                <span className="short" />
              </div>
              <div className="landing-demo-button">Continue to payment</div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="platform">
        <div className="stack-sm">
          <div className="badge badge-warning">HACKATHON FOCUS</div>
          <h2>Admin setup, public payment flow, and reporting in one working product.</h2>
          <p className="muted-text">
            The strongest demo path is simple: configure a page, share the public link, complete a Stripe test payment,
            and show the resulting transaction in reporting.
          </p>
        </div>
        <div className="landing-feature-grid">
          {features.map(({ title, copy, icon: Icon }) => (
            <article key={title} className="card card-padding stack-md">
              <Icon size={20} aria-hidden="true" />
              <div className="stack-sm">
                <h3 className="card-title">{title}</h3>
                <p className="muted-text">{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" id="demo-flow">
        <div className="stack-sm">
          <div className="badge badge-info">DEMO FLOW</div>
          <h2>Present the product in four clean moves.</h2>
        </div>
        <div className="landing-feature-grid">
          <article className="card card-padding stack-sm">
            <h3 className="card-title">1. Build the page</h3>
            <p className="muted-text">Use the admin editor to configure branding, amount rules, and distribution assets.</p>
          </article>
          <article className="card card-padding stack-sm">
            <h3 className="card-title">2. Share the page</h3>
            <p className="muted-text">Copy the public URL, iframe snippet, or QR code directly from the distribution panel.</p>
          </article>
          <article className="card card-padding stack-sm">
            <h3 className="card-title">3. Complete payment</h3>
            <p className="muted-text">Open the public payment page and process a Stripe sandbox card payment in real time.</p>
          </article>
        </div>
      </section>

      <section className="landing-section" id="accessibility">
        <div className="stack-sm">
          <div className="badge badge-success">ACCESSIBILITY</div>
          <h2>Built around a cleaner payer experience.</h2>
          <p className="muted-text">
            The public payment page now prioritizes labeled fields, visible focus states, keyboard-friendly form flow,
            and clearer error messaging so the demo aligns with the WCAG requirement in the brief.
          </p>
        </div>
      </section>
    </div>
  )
}
