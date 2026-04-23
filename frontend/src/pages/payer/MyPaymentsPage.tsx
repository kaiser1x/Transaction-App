import { CreditCard, Receipt, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { payerApi } from '../../api/payerApi'
import PageHeader from '../../components/admin/PageHeader'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import StatCard from '../../components/common/StatCard'
import StatusPill from '../../components/common/StatusPill'
import type { Transaction } from '../../types/transaction'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function MyPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    payerApi.listMyPayments().then(setTransactions)
  }, [])

  const summary = useMemo(() => {
    const successful = transactions.filter((transaction) => transaction.status === 'success')
    return {
      totalPaid: successful.reduce((sum, transaction) => sum + transaction.amount, 0),
      successfulPayments: successful.length,
      pendingPayments: transactions.filter((transaction) => transaction.status === 'pending').length,
      failedPayments: transactions.filter((transaction) => transaction.status === 'failed').length,
    }
  }, [transactions])

  return (
    <div className="stack-lg">
      <PageHeader
        title="Payment log"
        description="Review your recent payment activity, track pending items, and keep a clean receipt trail for your account."
      />

      <div className="stats-grid">
        <StatCard title="Total paid" value={formatCurrency(summary.totalPaid)} icon={<Wallet size={18} />} footnote="Successful transactions on your account" />
        <StatCard title="Completed" value={String(summary.successfulPayments)} icon={<Receipt size={18} />} footnote="Payments that cleared successfully" />
        <StatCard title="Pending" value={String(summary.pendingPayments)} icon={<CreditCard size={18} />} footnote="Transactions still awaiting confirmation" />
      </div>

      {transactions.length > 0 ? (
        <div className="stack-md">
          {transactions.map((transaction) => (
            <Card key={transaction.id} padded={false}>
              <div className="list-card">
                <div>
                  <div className="split-row">
                    <h3 className="card-title" style={{ margin: 0 }}>
                      {transaction.pageTitle ?? 'Wayspend payment'}
                    </h3>
                    <StatusPill status={transaction.status} />
                  </div>
                  <div className="list-metadata muted-text">
                    <span>{formatCurrency(transaction.amount)}</span>
                    <span>{transaction.paymentMethod.toUpperCase()}</span>
                    <span>{formatDateTime(transaction.createdAt)}</span>
                    {transaction.glCode ? <span>{transaction.glCode}</span> : null}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No payments yet"
          message="Your payment history will show up here after you complete a charge using one of the available payment pages."
        />
      )}
    </div>
  )
}
