import type { PaymentPage } from '../../types/paymentPage'
import type { PaymentMethod } from '../../types/transaction'
import BillSummaryCard from '../payment/BillSummaryCard'
import PaymentOptionCard from '../payment/PaymentOptionCard'
import SecureFooter from '../payment/SecureFooter'
import TrustPanel from '../payment/TrustPanel'
import Card from '../common/Card'
import Checkbox from '../common/Checkbox'
import Input from '../common/Input'
import Select from '../common/Select'

const paymentMethods: PaymentMethod[] = ['card', 'wallet', 'ach']

export default function PreviewPanel({ page }: { page: PaymentPage }) {
  const previewAmount =
    page.amountMode === 'fixed' ? page.fixedAmount ?? 0 : page.amountMode === 'range' ? page.minAmount ?? 0 : 125

  return (
    <div className="preview-shell">
      <Card className="preview-panel stack-md">
        <div>
          <div className="badge badge-info">Live preview</div>
          <h3>Payer page rendering</h3>
          <p className="muted-text">Updates immediately as builder inputs change.</p>
        </div>
        <div className="payment-preview">
          <div className="payment-preview-header" style={{ background: page.brandColor || 'var(--navy-900)' }}>
            <div className="stack-sm">
              <strong>{page.organizationName ?? 'Wayspend provider'}</strong>
              <div className="serif" style={{ fontSize: '1.6rem' }}>
                {page.title || 'Untitled payment page'}
              </div>
              <p style={{ margin: 0, opacity: 0.84 }}>{page.headerMessage || 'Secure payment powered by Wayspend.'}</p>
            </div>
          </div>
          <div className="payment-preview-body">
            <BillSummaryCard page={page} amount={previewAmount} />
            <div className="card card-padding stack-md">
              <Input label="Payer name" value="Jordan Smith" readOnly />
              <Input label="Email address" value="jordan@example.com" readOnly />
              {page.customFields.map((field) =>
                field.fieldType === 'dropdown' ? (
                  <Select
                    key={field.id}
                    label={field.label}
                    value={field.options?.[0] ?? ''}
                    options={(field.options ?? ['Option']).map((option) => ({ label: option, value: option }))}
                    disabled
                  />
                ) : field.fieldType === 'checkbox' ? (
                  <Checkbox key={field.id} label={field.label} helperText={field.helperText} checked={false} readOnly />
                ) : (
                  <Input
                    key={field.id}
                    label={field.label}
                    type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                    value=""
                    placeholder={field.placeholder}
                    readOnly
                  />
                ),
              )}
            </div>
            <div className="card card-padding stack-md">
              <strong>Payment option</strong>
              <div className="payment-method-grid">
                {paymentMethods.map((method) => (
                  <PaymentOptionCard key={method} method={method} selected={method === 'card'} onSelect={() => undefined} />
                ))}
              </div>
              <div className="stripe-placeholder">
                <strong>Stripe payment element area</strong>
                <p className="muted-text">Integration-ready seam for live client secret and Stripe Elements wiring.</p>
                <div className="stripe-lines">
                  <span />
                  <span />
                  <span style={{ width: '72%' }} />
                </div>
              </div>
            </div>
            <TrustPanel />
            <SecureFooter />
          </div>
        </div>
      </Card>
    </div>
  )
}
