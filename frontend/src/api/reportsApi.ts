import type { ApiReportByGl, ApiReportByMethod, ApiReportSummary, ApiTransaction } from '../types/api'
import type { ReportFilters, ReportPayload } from '../types/report'
import type { PaymentMethod, Transaction } from '../types/transaction'
import { downloadCsv, getByGl, getByMethod, getSummary, listTransactions } from './reports'

function mapMethod(method: ApiTransaction['payment_method']): PaymentMethod {
  if (method === 'credit_card') return 'card'
  return method
}

function buildStartDate(range: ReportFilters['dateRange']) {
  const date = new Date()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function mapTransaction(transaction: ApiTransaction): Transaction {
  return {
    id: transaction.id,
    pageId: transaction.page_id,
    pageTitle: (transaction as ApiTransaction & { page_title?: string }).page_title,
    payerName: transaction.payer_name ?? undefined,
    payerEmail: transaction.payer_email ?? undefined,
    amount: Number(transaction.amount),
    paymentMethod: mapMethod(transaction.payment_method),
    status: transaction.status,
    glCode: transaction.gl_code ?? undefined,
    createdAt: transaction.created_at,
  }
}

function summarizeTransactions(transactions: ReportPayload['transactions']) {
  const successful = transactions.filter((transaction) => transaction.status === 'success')
  const totalCollected = successful.reduce((sum, transaction) => sum + transaction.amount, 0)
  return {
    totalCollected,
    averagePaymentAmount: successful.length ? totalCollected / successful.length : 0,
    successfulPayments: successful.length,
    failedPayments: transactions.filter((transaction) => transaction.status === 'failed').length,
    pendingPayments: transactions.filter((transaction) => transaction.status === 'pending').length,
  }
}

function mapGlBreakdown(items: ApiReportByGl[]) {
  return items.map((item) => ({
    label: item.gl_code ?? 'Unassigned',
    value: Number(item.count),
    amount: Number(item.total),
  }))
}

function mapMethodBreakdown(items: ApiReportByMethod[]) {
  return items.map((item) => ({
    label: mapMethod(item.payment_method as ApiTransaction['payment_method']).toUpperCase(),
    value: Number(item.count),
    amount: Number(item.total),
  }))
}

export const reportsApi = {
  async getSummary(filters: ReportFilters) {
    return this.getReport(filters).then((report) => report.summary)
  },
  async getTransactions(filters: ReportFilters) {
    return this.getReport(filters).then((report) => report.transactions)
  },
  async getReport(filters: ReportFilters) {
    const query = {
      pageId: filters.pageId === 'all' ? undefined : filters.pageId,
      status: filters.status === 'all' ? undefined : filters.status,
      startDate: buildStartDate(filters.dateRange),
    }

    const [summary, transactions, glBreakdown, methodBreakdown] = await Promise.all([
      getSummary(query),
      listTransactions(query),
      getByGl(query),
      getByMethod(query),
    ])

    let mappedTransactions = transactions.map(mapTransaction)
    if (filters.method !== 'all') {
      mappedTransactions = mappedTransactions.filter((transaction) => transaction.paymentMethod === filters.method)
    }

    const clientSummary = summarizeTransactions(mappedTransactions)
    const backendSummary = summary as ApiReportSummary

    return {
      summary: {
        totalCollected: clientSummary.totalCollected || Number(backendSummary.total_collected),
        averagePaymentAmount: clientSummary.averagePaymentAmount || Number(backendSummary.avg_amount),
        successfulPayments: clientSummary.successfulPayments || backendSummary.success_count,
        failedPayments: clientSummary.failedPayments || backendSummary.failed_count,
        pendingPayments: clientSummary.pendingPayments || backendSummary.pending_count,
        activePages: 0,
      },
      transactions: mappedTransactions,
      glCodeBreakdown: mapGlBreakdown(glBreakdown),
      paymentMethodBreakdown: mapMethodBreakdown(methodBreakdown),
    }
  },
  async downloadCsv(filters: ReportFilters) {
    await downloadCsv({
      pageId: filters.pageId === 'all' ? undefined : filters.pageId,
      status: filters.status === 'all' ? undefined : filters.status,
      startDate: buildStartDate(filters.dateRange),
    })
  },
}
