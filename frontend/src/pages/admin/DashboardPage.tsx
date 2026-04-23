import { Activity, BadgeDollarSign, CircleAlert, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { pagesApi } from '../../api/pagesApi'
import { reportsApi } from '../../api/reportsApi'
import ActivityTable from '../../components/admin/ActivityTable'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import LoadingState from '../../components/common/LoadingState'
import StatCard from '../../components/common/StatCard'
import { useSession } from '../../context/SessionContext'
import type { ReportPayload } from '../../types/report'
import { formatCurrency } from '../../utils/formatters'

const defaultFilters = {
  dateRange: '30d',
  pageId: 'all',
  status: 'all',
  method: 'all',
} as const

export default function DashboardPage() {
  const { user, loading } = useSession()
  const [report, setReport] = useState<ReportPayload | null>(null)
  const [pagesCount, setPagesCount] = useState(0)

  useEffect(() => {
    if (user?.role !== 'admin') return
    reportsApi.getReport(defaultFilters).then(setReport)
    pagesApi.list().then((pages) => setPagesCount(pages.length))
  }, [user?.role])

  if (loading) return <LoadingState title="Opening your dashboard..." />

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard/payment-options" replace />
  }

  if (!report) return <LoadingState />

  return (
    <div className="stack-lg">
      <PageHeader
        title="Workspace dashboard"
        description="Monitor collection performance, recent activity, and operational readiness for your organization."
        actions={
          <Link to="/dashboard/payment-pages/new">
            <Button>Create new page</Button>
          </Link>
        }
      />

      <div className="stats-grid">
        <StatCard title="Total collected" value={formatCurrency(report.summary.totalCollected)} icon={<BadgeDollarSign size={18} />} footnote="Successful payments in the selected window" />
        <StatCard title="Average payment amount" value={formatCurrency(report.summary.averagePaymentAmount)} icon={<Wallet size={18} />} footnote="Across successful payments" />
        <StatCard title="Successful payments" value={String(report.summary.successfulPayments)} icon={<Activity size={18} />} footnote={`${pagesCount} pages are currently configured`} />
        <StatCard title="Failed or pending" value={String(report.summary.failedPayments + report.summary.pendingPayments)} icon={<CircleAlert size={18} />} footnote="Use reporting to isolate statuses and methods" />
      </div>

      <div className="dashboard-grid">
        <div className="stack-lg">
          <ActivityTable transactions={report.transactions.slice(0, 6)} />
        </div>
        <div className="stack-lg">
          <Card className="insight-card">
            <div className="card-header">
              <div>
                <div className="badge badge-warning">Insight</div>
                <h2 className="card-title" style={{ color: 'var(--cream-50)' }}>
                  Suggested next move
                </h2>
              </div>
            </div>
            <div className="stack-md">
              <p style={{ margin: 0 }}>
                Deposit collection pages are converting at higher amounts than fixed balance pages in the current reporting window.
              </p>
              <p className="muted-text">
                Use the public landing page for acquisition, then move authenticated users into the workspace and role-gated tools.
              </p>
              <Link to="/dashboard/payment-pages">
                <Button variant="secondary">Open payment pages</Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <div>
                <h2 className="card-title">Rollout readiness</h2>
                <p className="card-subtitle">What the current frontend already supports for backend hookup.</p>
              </div>
            </div>
            <div className="stack-sm">
              <div className="summary-row">
                <span>Authenticated dashboard access</span>
                <strong>Ready</strong>
              </div>
              <div className="summary-row">
                <span>Builder and live preview</span>
                <strong>Ready</strong>
              </div>
              <div className="summary-row">
                <span>Public payment flow</span>
                <strong>Ready for Stripe seam</strong>
              </div>
              <div className="summary-row">
                <span>Reporting</span>
                <strong>Connected to backend reports</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
