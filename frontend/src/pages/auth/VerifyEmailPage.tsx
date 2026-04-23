import { MailCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { useSession } from '../../context/SessionContext'
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../../utils/constants'

export default function VerifyEmailPage() {
  const { user, markVerified } = useSession()

  return (
    <Card className="stack-lg">
      <div className="stack-sm">
        <div className="badge badge-warning">Verification state</div>
        <h1>Verify your account before opening protected tools.</h1>
        <p>
          This route mirrors the Auth0 verification checkpoint. Your permissions come from the backend user role, but
          protected sections still require a verified identity.
        </p>
      </div>
      <div className="card card-padding stack-md" style={{ background: 'var(--surface-muted)' }}>
        <div className="topbar-group">
          <MailCheck size={18} aria-hidden="true" />
          <strong>{user?.email ?? 'finance@example.com'}</strong>
        </div>
        <p className="muted-text">
          Auth0 domain: {AUTH0_DOMAIN} | client: {AUTH0_CLIENT_ID}
        </p>
      </div>
      <Button
        onClick={async () => {
          await markVerified()
        }}
      >
        Refresh verification status
      </Button>
      <Link to="/dashboard">
        <Button variant="secondary" block>
          Continue to dashboard
        </Button>
      </Link>
    </Card>
  )
}
