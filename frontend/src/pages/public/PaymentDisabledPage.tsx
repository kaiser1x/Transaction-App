import { PauseCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import PaymentStatusBanner from '../../components/payment/PaymentStatusBanner'

export default function PaymentDisabledPage() {
  return (
    <div className="status-page">
      <div className="status-icon" style={{ background: 'var(--warning-100)', color: 'var(--warning-500)' }}>
        <PauseCircle size={30} aria-hidden="true" />
      </div>
      <PaymentStatusBanner
        tone="warning"
        eyebrow="Page unavailable"
        title="This payment page is currently disabled."
        description="The page may be temporarily paused, expired, or still being prepared for release."
      >
        <div className="stack-sm">
          <p className="muted-text">Please contact your provider team for the most current payment instructions.</p>
          <Link to="/login">
            <Button variant="secondary">Return to sign in</Button>
          </Link>
        </div>
      </PaymentStatusBanner>
    </div>
  )
}
