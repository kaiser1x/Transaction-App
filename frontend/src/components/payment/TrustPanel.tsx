import { LockKeyhole, ShieldCheck, Stethoscope } from 'lucide-react'
import Card from '../common/Card'

const trustPoints = [
  {
    label: 'Healthcare-safe language',
    detail: 'The payer flow explains what is being collected and how to get support.',
    icon: Stethoscope,
  },
  {
    label: 'Secure processing seam',
    detail: 'Card entry stays inside Stripe Elements using sandbox credentials for the live walkthrough.',
    icon: LockKeyhole,
  },
  {
    label: 'Demo-safe environment',
    detail: 'This build uses mock data and Stripe test mode assumptions for safe walkthroughs.',
    icon: ShieldCheck,
  },
]

export default function TrustPanel() {
  return (
    <Card className="trust-panel stack-md">
      <div>
        <div className="badge badge-success">Trust panel</div>
        <h3>Designed to reduce payer hesitation</h3>
      </div>
      {trustPoints.map(({ label, detail, icon: Icon }) => (
        <div key={label} className="split-row">
          <div className="topbar-group">
            <Icon size={18} aria-hidden="true" />
            <strong>{label}</strong>
          </div>
          <span className="muted-text" style={{ maxWidth: '28rem' }}>
            {detail}
          </span>
        </div>
      ))}
    </Card>
  )
}
