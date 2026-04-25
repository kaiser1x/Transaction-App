import { CheckCircle2 } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import PaymentStatusBanner from '../../components/payment/PaymentStatusBanner'
import type { PaymentPage } from '../../types/paymentPage'
import type { Transaction } from '../../types/transaction'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function PaymentSuccessPage() {
  const { slug = '' } = useParams()
  const location = useLocation()
  const state = location.state as {
    transaction?: Transaction
    page?: PaymentPage
    receiptEmailSent?: boolean
    receiptEmail?: string | null
  } | null
  const transaction = state?.transaction
  const page = state?.page
  const receiptEmailSent = state?.receiptEmailSent
  const receiptEmail = state?.receiptEmail

  return (
    <div className="status-page">
      <div className="status-icon" style={{ background: 'var(--success-100)', color: 'var(--success-500)' }}>
        <CheckCircle2 size={30} aria-hidden="true" />
      </div>
      <PaymentStatusBanner
        tone="success"
        eyebrow="Payment received"
        title="Your payment was submitted successfully."
        description="This receipt confirms the submitted payment and gives the payer a clean next step."
      >
        <div className="stack-sm">
          <div className="summary-row">
            <span>Transaction ID</span>
            <strong>{transaction?.id ?? 'Pending confirmation'}</strong>
          </div>
          <div className="summary-row">
            <span>Amount paid</span>
            <strong>{formatCurrency(transaction?.amount ?? page?.fixedAmount ?? 0)}</strong>
          </div>
          <div className="summary-row">
            <span>Provider</span>
            <strong>{page?.organizationName ?? 'Wayspend provider'}</strong>
          </div>
          <div className="summary-row">
            <span>Date</span>
            <strong>{formatDateTime(transaction?.createdAt ?? new Date().toISOString())}</strong>
          </div>
          {receiptEmail ? (
            <p className="muted-text">
              {receiptEmailSent
                ? `A confirmation email was sent to ${receiptEmail}.`
                : `Payment recorded successfully, but the receipt email could not be sent to ${receiptEmail}.`}
            </p>
          ) : null}
          <p className="muted-text">
            Next step: the provider team can reconcile this payment in the reporting workspace.
          </p>
          <div className="action-row">
            <Link to={`/pay/${slug}`}>
              <Button variant="secondary">Make another payment</Button>
            </Link>
            <Link to="/login">
              <Button>Return to sign in</Button>
            </Link>
          </div>
        </div>
      </PaymentStatusBanner>
    </div>
  )
}
