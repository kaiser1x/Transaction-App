import type { Transaction } from '../../types/transaction'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import Card from '../common/Card'
import StatusPill from '../common/StatusPill'

export default function ActivityTable({
  transactions,
  title = 'Recent payment activity',
  description = 'Latest activity across all published pages.',
}: {
  transactions: Transaction[]
  title?: string
  description?: string
}) {
  return (
    <Card>
      <div className="card-header">
        <div>
          <h2 className="card-title">{title}</h2>
          <p className="card-subtitle">{description}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Payer</th>
              <th>Payment page</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <strong>{transaction.payerName ?? 'Guest payer'}</strong>
                  <div className="muted-text">{transaction.payerEmail}</div>
                </td>
                <td>
                  <strong>{transaction.pageTitle}</strong>
                  <div className="muted-text mono">{transaction.glCode ?? 'No GL code'}</div>
                </td>
                <td>{formatCurrency(transaction.amount)}</td>
                <td>{transaction.paymentMethod.toUpperCase()}</td>
                <td>
                  <StatusPill status={transaction.status} />
                </td>
                <td>{formatDateTime(transaction.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
