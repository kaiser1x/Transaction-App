import { ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useSession } from '../../context/SessionContext'

export default function LoginPage() {
  const location = useLocation()
  const { login } = useSession()
  const nextPath = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  return (
    <div className="stack-lg">
      <div className="stack-sm">
        <div className="badge badge-info">Client login</div>
        <h1>Sign in to your Wayspend workspace.</h1>
        <p>Authenticate with Auth0, sync your profile through the backend, and open the dashboard you’re allowed to access.</p>
      </div>
      <div className="stack-md">
        <Button
          block
          onClick={async () => {
            await login(nextPath)
          }}
        >
          Continue to login
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
      <p className="muted-text">
        Need an account? <Link to="/signup">Create one</Link>
      </p>
    </div>
  )
}
