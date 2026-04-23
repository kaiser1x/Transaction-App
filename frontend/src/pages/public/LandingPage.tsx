import { ArrowRight, CreditCard, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useSession } from '../../context/SessionContext'

const features = [
  {
    title: 'One database, one sign-on',
    copy: 'Authenticate through Auth0, then sync each user into the application database and show only the views they are allowed to access.',
    icon: LayoutDashboard,
  },
  {
    title: 'Configurable payment pages',
    copy: 'Build reusable healthcare payment pages, manage branding, and connect reporting without hardcoded front-end mocks.',
    icon: CreditCard,
  },
  {
    title: 'Trust-first payment experiences',
    copy: 'Give providers and payers a calm, accessible workflow designed for real healthcare payments.',
    icon: ShieldCheck,
  },
]

export default function LandingPage() {
  const { user } = useSession()

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <span className="landing-star">*</span>
          <strong>waystar</strong>
          <span>Payments Platform</span>
        </Link>
        <nav className="landing-links" aria-label="Primary">
          <a href="#platform">Platform</a>
          <a href="#solutions">Solutions</a>
          <a href="#resources">Resources</a>
          <a href="#company">Company</a>
        </nav>
        <div className="action-row">
          <Link to={user ? '/dashboard' : '/login'}>{user ? 'Open dashboard' : 'Client login'}</Link>
          <Link to="/signup">
            <Button>
              Get started
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy stack-lg">
          <div className="landing-badge">ALTITUDEAI - NEW</div>
          <h1>
            Transform healthcare
            <br />
            payments. <span>The Way Forward.</span>
          </h1>
          <p>
            A truly unified revenue cycle payments platform with one database, one sign-on, and authenticated,
            role-aware workflows for the people actually using the product.
          </p>
          <div className="action-row">
            <Link to={user ? '/dashboard' : '/signup'}>
              <Button>
                {user ? 'Open workspace' : 'Get started'}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/login" className="landing-secondary-link">
              Client login
            </Link>
          </div>
        </div>
        <div className="landing-art" aria-hidden="true">
          <div className="landing-sun" />
          <div className="landing-mountains mountains-mid" />
          <div className="landing-mountains mountains-front" />
        </div>
      </section>

      <section className="landing-section" id="platform">
        <div className="stack-sm">
          <div className="badge badge-warning">THE WAYSTAR PLATFORM</div>
          <h2>Everything you need to transform healthcare payments.</h2>
          <p className="muted-text">
            Public marketing at the front door, authenticated dashboard access behind it, and operational tooling shown
            only when the signed-in database role actually allows it.
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
    </div>
  )
}
