import type { PaymentPage } from '../types/paymentPage'
import { confirmPayment, createPaymentIntent } from './payments'
import { getPageBySlug } from './pages'

type PublicPaymentPayload = {
  pageId: string
  amount: number
  payerName: string
  payerEmail: string
  paymentMethod: 'card' | 'ach' | 'wallet'
  glCode?: string
  fieldResponses?: { fieldId: string; value: string }[]
}

function mapPaymentMethod(method: PublicPaymentPayload['paymentMethod']) {
  if (method === 'card') return 'credit_card'
  return method
}

function parseList(value: string[] | string | null | undefined) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value) as string[]
  } catch {
    return []
  }
}

export const paymentsApi = {
  async getPublicPage(slug: string) {
    const page = await getPageBySlug(slug)
    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      description: page.description ?? undefined,
      brandColor: page.brand_color,
      logoUrl: page.logo_url ?? undefined,
      headerMessage: page.header_msg ?? undefined,
      footerMessage: page.footer_msg ?? undefined,
      amountMode: page.amount_mode === 'fixed' ? 'fixed' : page.amount_mode === 'min_max' ? 'range' : 'open',
      fixedAmount: page.fixed_amount ? Number(page.fixed_amount) : undefined,
      minAmount: page.min_amount ? Number(page.min_amount) : undefined,
      maxAmount: page.max_amount ? Number(page.max_amount) : undefined,
      glCodes: parseList(page.gl_codes),
      isActive: page.is_active,
      customFields: (page.custom_fields ?? [])
        .map((field) => ({
          id: field.id,
          label: field.label,
          fieldType: field.field_type,
          required: field.required,
          placeholder: field.placeholder ?? undefined,
          helperText: field.helper_text ?? undefined,
          options: parseList(field.options),
          order: field.display_order,
        }))
        .sort((a, b) => a.order - b.order),
    } satisfies PaymentPage
  },
  async createIntent(payload: Omit<PublicPaymentPayload, 'paymentMethod' | 'glCode' | 'fieldResponses'>) {
    return createPaymentIntent(payload)
  },
  async confirm(payload: PublicPaymentPayload & { stripeIntentId: string }) {
    return confirmPayment({
      stripeIntentId: payload.stripeIntentId,
      pageId: payload.pageId,
      amount: payload.amount,
      paymentMethod: mapPaymentMethod(payload.paymentMethod),
      payerName: payload.payerName,
      payerEmail: payload.payerEmail,
      glCode: payload.glCode,
      fieldResponses: payload.fieldResponses,
    })
  },
}
