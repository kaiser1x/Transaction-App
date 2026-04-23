import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useSession } from '../../context/SessionContext'

export default function SignupPage() {
  const { signup } = useSession()

  return (
    <div className="stack-lg">
      <div className="stack-sm">
        <div className="badge badge-info">Create account</div>
        <h1>Create your Wayspend login.</h1>
        <p>Use Auth0 sign-up to create an account, then sync your role-aware profile into the application database.</p>
      </div>
      <div className="stack-md">
        <Button
          block
          onClick={async () => {
            await signup('/dashboard')
          }}
        >
          Continue to sign up
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
      <p className="muted-text">
        Already have access? <Link to="/login">Sign in</Link>
      </p>
    </div>
  )
}
