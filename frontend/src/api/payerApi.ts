import type { ApiPaymentPage, ApiTransaction } from '../types/api'
import type { PaymentPage } from '../types/paymentPage'
import type { PaymentMethod, Transaction } from '../types/transaction'
import { api } from './client'
import { listAvailablePages } from './pages'

function parseList(value: string | null) {
  if (!value) return []
  try {
    return JSON.parse(value) as string[]
  } catch {
    return []
  }
}

function mapAmountMode(mode: ApiPaymentPage['amount_mode']): PaymentPage['amountMode'] {
  if (mode === 'fixed') return 'fixed'
  if (mode === 'min_max') return 'range'
  return 'open'
}

function mapPage(page: ApiPaymentPage): PaymentPage {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    description: page.description ?? undefined,
    brandColor: page.brand_color,
    logoUrl: page.logo_url ?? undefined,
    headerMessage: page.header_msg ?? undefined,
    footerMessage: page.footer_msg ?? undefined,
    amountMode: mapAmountMode(page.amount_mode),
    fixedAmount: page.fixed_amount ? Number(page.fixed_amount) : undefined,
    minAmount: page.min_amount ? Number(page.min_amount) : undefined,
    maxAmount: page.max_amount ? Number(page.max_amount) : undefined,
    glCodes: parseList(page.gl_codes),
    isActive: page.is_active,
    customFields: [],
    lastUpdated: page.updated_at,
  }
}

function mapMethod(method: ApiTransaction['payment_method']): PaymentMethod {
  if (method === 'credit_card') return 'card'
  return method
}

function mapTransaction(transaction: ApiTransaction & { page_title?: string }): Transaction {
  return {
    id: transaction.id,
    pageId: transaction.page_id,
    pageTitle: transaction.page_title,
    payerName: transaction.payer_name ?? undefined,
    payerEmail: transaction.payer_email ?? undefined,
    amount: Number(transaction.amount),
    paymentMethod: mapMethod(transaction.payment_method),
    status: transaction.status,
    glCode: transaction.gl_code ?? undefined,
    createdAt: transaction.created_at,
  }
}

export const payerApi = {
  async listPaymentOptions() {
    const pages = await listAvailablePages()
    return pages.map(mapPage)
  },
  async listMyPayments() {
    const transactions = await api.get<(ApiTransaction & { page_title?: string })[]>('/api/payments/mine')
    return transactions.map(mapTransaction)
  },
}
