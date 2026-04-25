import { PaymentElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'
import { ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { paymentsApi } from '../../api/paymentsApi'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Checkbox from '../../components/common/Checkbox'
import EmptyState from '../../components/common/EmptyState'
import Input from '../../components/common/Input'
import LoadingState from '../../components/common/LoadingState'
import Select from '../../components/common/Select'
import BillSummaryCard from '../../components/payment/BillSummaryCard'
import SecureFooter from '../../components/payment/SecureFooter'
import TrustPanel from '../../components/payment/TrustPanel'
import type { PaymentPage } from '../../types/paymentPage'
import { STRIPE_PUBLISHABLE_KEY } from '../../utils/constants'

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null

type PendingPayment = {
  stripeIntentId: string
  pageId: string
  amount: number
  payerName: string
  payerEmail: string
  glCode?: string
  fieldResponses?: { fieldId: string; value: string }[]
}

function StripeCardCapture({
  clientSecret,
  payerName,
  payerEmail,
  busy,
  onConfirmed,
  onError,
}: {
  clientSecret: string
  payerName: string
  payerEmail: string
  busy: boolean
  onConfirmed: () => Promise<void>
  onError: (message: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()

  async function handleConfirm() {
    if (!stripe || !elements) {
      onError('Stripe is still loading. Try again in a moment.')
      return
    }

    const submitted = await elements.submit()
    if (submitted.error) {
      onError(submitted.error.message ?? 'Please review your card details and try again.')
      return
    }

    const result = await stripe.confirmPayment({
      clientSecret,
      elements,
      redirect: 'if_required',
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: payerName,
            email: payerEmail,
          },
        },
      },
    })

    if (result.error) {
      onError(result.error.message ?? 'Stripe could not confirm this payment.')
      return
    }

    if (!result.paymentIntent || !['succeeded', 'processing'].includes(result.paymentIntent.status)) {
      onError('Payment confirmation is still pending. Please try again.')
      return
    }

    await onConfirmed()
  }

  return (
    <section className="stripe-live-region stack-md" aria-live="polite" aria-labelledby="card-details-heading">
      <div className="stack-sm">
        <strong id="card-details-heading">Enter card details</strong>
        <p className="muted-text">
          Test in sandbox with card `4242 4242 4242 4242`, any future date, any CVC, and any ZIP code.
        </p>
      </div>
      <div className="stripe-element-shell">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      <Button type="button" block disabled={!stripe || !elements || busy} onClick={() => void handleConfirm()}>
        {busy ? 'Processing payment...' : 'Pay securely now'}
        <CheckCircle2 size={16} aria-hidden="true" />
      </Button>
    </section>
  )
}

export default function PublicPaymentPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState<PaymentPage | null | undefined>(undefined)
  const [payerName, setPayerName] = useState('')
  const [payerEmail, setPayerEmail] = useState('')
  const [amount, setAmount] = useState(0)
  const [glCode, setGlCode] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    paymentsApi
      .getPublicPage(slug)
      .then((result) => {
        setPage(result)
        if (!result) return

        if (result.amountMode === 'fixed') setAmount(result.fixedAmount ?? 0)
        if (result.amountMode === 'range') setAmount(result.minAmount ?? 0)
        setGlCode(result.glCodes?.[0] ?? 'Unassigned')
      })
      .catch(() => {
        setPage(null)
      })
  }, [slug])

  useEffect(() => {
    setClientSecret('')
    setPendingPayment(null)
  }, [payerName, payerEmail, amount, glCode, slug])

  const customFieldInputs = useMemo(() => page?.customFields ?? [], [page])

  if (page === undefined) return <LoadingState title="Opening secure payment page..." />
  if (page === null) {
    return (
      <div className="public-shell">
        <EmptyState title="Payment page not found" message="The requested page could not be loaded." />
      </div>
    )
  }

  if (!page.isActive) {
    return <Navigate to={`/pay/${slug}/disabled`} replace />
  }
  const activePage: PaymentPage = page

  const stripeOptions: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: activePage.brandColor || '#e8743c',
            colorText: '#10294b',
            colorBackground: '#ffffff',
          },
        },
      }
    : undefined

  async function finalizePayment(payload: PendingPayment) {
    const result = await paymentsApi.confirm({
      stripeIntentId: payload.stripeIntentId,
      pageId: payload.pageId,
      payerName: payload.payerName,
      payerEmail: payload.payerEmail,
      amount: payload.amount,
      paymentMethod: 'card',
      glCode: payload.glCode,
      fieldResponses: payload.fieldResponses,
    })

    navigate(`/pay/${slug}/${result.status === 'success' ? 'success' : 'failure'}`, {
      state: {
        transaction: {
          id: result.transactionId,
          pageId: activePage.id,
          pageTitle: activePage.title,
          payerName: payload.payerName,
          payerEmail: payload.payerEmail,
          amount: payload.amount,
          paymentMethod: 'card',
          status: result.status,
          glCode: payload.glCode,
          createdAt: new Date().toISOString(),
        },
        page: activePage,
        receiptEmailSent: result.receiptEmailSent,
        receiptEmail: result.receiptEmail,
      },
    })
  }

  async function handlePreparePayment(formData: FormData) {
    setSubmitting(true)
    setError(null)

    const amountValue =
      activePage.amountMode === 'fixed' ? activePage.fixedAmount ?? 0 : Number(formData.get('amount') ?? amount) || 0
    const nextPayerName = String(formData.get('payerName') ?? payerName).trim()
    const nextPayerEmail = String(formData.get('payerEmail') ?? payerEmail).trim()
    const nextGlCode = String(formData.get('glCode') ?? glCode ?? activePage.glCodes?.[0] ?? '').trim()

    const fieldResponses = customFieldInputs
      .map((field) => {
        const rawValue = formData.get(field.id)
        const value =
          field.fieldType === 'checkbox'
            ? rawValue
              ? 'true'
              : ''
            : String(rawValue ?? '').trim()

        return { fieldId: field.id, value }
      })
      .filter((field) => field.value)

    try {
      const intent = await paymentsApi.createIntent({
        pageId: activePage.id,
        payerName: nextPayerName,
        payerEmail: nextPayerEmail,
        amount: amountValue,
      })

      const payload: PendingPayment = {
        stripeIntentId: intent.intentId,
        pageId: activePage.id,
        payerName: nextPayerName,
        payerEmail: nextPayerEmail,
        amount: amountValue,
        glCode: nextGlCode,
        fieldResponses,
      }

      if (intent.intentId.startsWith('mock_pi_')) {
        await finalizePayment(payload)
        return
      }

      setPendingPayment(payload)
      setClientSecret(intent.clientSecret)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit payment right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="public-shell" aria-busy={submitting}>
      <div className="public-grid">
        <section className="stack-lg" aria-labelledby="bill-summary-heading">
          <div id="bill-summary-heading" className="sr-only">
            Bill summary
          </div>
          <BillSummaryCard page={activePage} amount={amount} />
          <TrustPanel />
        </section>

        <section className="stack-lg" aria-labelledby="payment-form-heading">
          <Card className="payment-card stack-lg">
            <div className="stack-sm">
              <div className="badge badge-warning">Quick payment page</div>
              <h1 id="payment-form-heading">{activePage.title}</h1>
              <p>{activePage.description}</p>
            </div>

            <form
              className="stack-lg"
              aria-describedby={error ? 'payment-form-error' : 'payment-form-help'}
              onSubmit={async (event) => {
                event.preventDefault()
                await handlePreparePayment(new FormData(event.currentTarget))
              }}
            >
              <div className="card card-padding stack-md payment-note" id="payment-form-help" role="status">
                <div className="topbar-group">
                  <Info size={18} aria-hidden="true" />
                  <strong>{activePage.headerMessage || 'Securely review your balance and continue to card payment.'}</strong>
                </div>
                <p className="muted-text">
                  This payment page is keyboard navigable, Stripe-backed, and validated against your configured payment rules.
                </p>
              </div>

              {error ? (
                <p className="input-error" id="payment-form-error" role="alert" aria-live="assertive">
                  {error}
                </p>
              ) : null}

              <div className="form-grid-2">
                <Input
                  label="Payer name"
                  name="payerName"
                  required
                  placeholder="Full name"
                  value={payerName}
                  onChange={(event) => setPayerName(event.target.value)}
                  autoComplete="name"
                />
                <Input
                  label="Email address"
                  name="payerEmail"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={payerEmail}
                  onChange={(event) => setPayerEmail(event.target.value)}
                  autoComplete="email"
                />
              </div>

              {activePage.amountMode !== 'fixed' ? (
                <Input
                  label={activePage.amountMode === 'range' ? 'Payment amount' : 'Amount to pay'}
                  name="amount"
                  type="number"
                  min={activePage.amountMode === 'range' ? String(activePage.minAmount ?? 0) : '1'}
                  max={activePage.amountMode === 'range' ? String(activePage.maxAmount ?? 10000) : undefined}
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value) || 0)}
                  helperText={
                    activePage.amountMode === 'range'
                      ? `Allowed range: ${activePage.minAmount} to ${activePage.maxAmount}`
                      : 'Enter the amount you would like to submit.'
                  }
                  required
                />
              ) : null}

              {customFieldInputs.map((field) =>
                field.fieldType === 'dropdown' ? (
                  <Select
                    key={field.id}
                    label={field.label}
                    name={field.id}
                    required={field.required}
                    options={(field.options ?? []).map((option) => ({ label: option, value: option }))}
                  />
                ) : field.fieldType === 'checkbox' ? (
                  <Checkbox key={field.id} label={field.label} name={field.id} helperText={field.helperText} />
                ) : (
                  <Input
                    key={field.id}
                    label={field.label}
                    name={field.id}
                    type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                    required={field.required}
                    placeholder={field.placeholder}
                    helperText={field.helperText}
                  />
                ),
              )}

              <Select
                label="GL code"
                name="glCode"
                value={glCode}
                onChange={(event) => setGlCode(event.target.value)}
                options={(activePage.glCodes ?? ['Unassigned']).map((code) => ({ label: code, value: code }))}
              />

              <fieldset className="card-payment-choice stack-sm">
                <legend className="input-label">Payment method</legend>
                <p className="muted-text">Card payment is enabled for the live demo. Wallet and ACH stay out of the way until they are production-ready.</p>
                <div className="payment-method-chip" role="status" aria-live="polite">
                  Card payment enabled
                </div>
              </fieldset>

              {!clientSecret ? (
                <Button type="submit" block disabled={submitting}>
                  {submitting ? 'Preparing secure card entry...' : 'Continue to card details'}
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              ) : stripePromise && stripeOptions && pendingPayment ? (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <StripeCardCapture
                    clientSecret={clientSecret}
                    payerName={pendingPayment.payerName}
                    payerEmail={pendingPayment.payerEmail}
                    busy={submitting}
                    onError={setError}
                    onConfirmed={async () => {
                      setSubmitting(true)
                      setError(null)
                      try {
                        await finalizePayment(pendingPayment)
                      } catch (submitError) {
                        setError(submitError instanceof Error ? submitError.message : 'Unable to finalize the payment.')
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                  />
                </Elements>
              ) : (
                <EmptyState
                  title="Stripe key missing"
                  message="Add the Stripe publishable key to the frontend environment before demoing the live card form."
                />
              )}
            </form>
            <SecureFooter />
          </Card>
        </section>
      </div>
    </main>
  )
}
