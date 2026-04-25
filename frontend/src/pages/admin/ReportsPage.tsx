import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { pagesApi } from '../../api/pagesApi'
import { reportsApi } from '../../api/reportsApi'
import ActivityTable from '../../components/admin/ActivityTable'
import PageHeader from '../../components/admin/PageHeader'
import ReportFilters from '../../components/admin/ReportFilters'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import LoadingState from '../../components/common/LoadingState'
import StatCard from '../../components/common/StatCard'
import type { PaymentPage } from '../../types/paymentPage'
import type { ReportFilters as ReportFiltersType, ReportPayload } from '../../types/report'
import { formatCurrency } from '../../utils/formatters'

const initialFilters: ReportFiltersType = {
  dateRange: '30d',
  pageId: 'all',
  status: 'all',
  method: 'all',
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersType>(initialFilters)
  const [pages, setPages] = useState<PaymentPage[]>([])
  const [report, setReport] = useState<ReportPayload | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPages() {
      try {
        const nextPages = await pagesApi.list()
        if (!cancelled) setPages(nextPages)
      } catch (error) {
        console.error('Failed to load payment pages:', error)
      }
    }

    void loadPages()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadReport() {
      try {
        const nextReport = await reportsApi.getReport(filters)
        if (!cancelled) setReport(nextReport)
      } catch (error) {
        console.error('Failed to refresh reports:', error)
      }
    }

    void loadReport()

    const refresh = () => {
      void loadReport()
    }

    const intervalId = window.setInterval(refresh, 15000)
    window.addEventListener('focus', refresh)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
    }
  }, [filters])

  if (!report) return <LoadingState title="Loading reporting workspace..." />

  return (
    <div className="stack-lg">
      <PageHeader
        title="Reporting"
        description="Review collection outcomes, isolate page performance, and monitor method and GL breakdowns."
        actions={
          <Button variant="secondary" onClick={() => void reportsApi.downloadCsv(filters)}>
            <Download size={16} aria-hidden="true" />
            Export CSV
          </Button>
        }
      />

      <ReportFilters filters={filters} pages={pages} onChange={setFilters} />

      <div className="stats-grid">
        <StatCard title="Total collected" value={formatCurrency(report.summary.totalCollected)} />
        <StatCard title="Average payment" value={formatCurrency(report.summary.averagePaymentAmount)} />
        <StatCard title="Successful payments" value={String(report.summary.successfulPayments)} />
        <StatCard title="Active pages" value={String(pages.filter((page) => page.isActive).length)} />
      </div>

      <div className="breakdown-grid">
        <Card className="w-full">
          <div className="card-header">
            <div>
              <h2 className="card-title">GL code breakdown</h2>
              <p className="card-subtitle">Payment counts and routed volume by accounting bucket.</p>
            </div>
          </div>
          <div className="stack-sm">
            {report.glCodeBreakdown.map((item) => (
              <div key={item.label} className="summary-row">
                <span>{item.label}</span>
                <strong>
                  {item.value} payments | {formatCurrency(item.amount)}
                </strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="w-full">
          <div className="card-header">
            <div>
              <h2 className="card-title">Payment method breakdown</h2>
              <p className="card-subtitle">Useful when demonstrating card versus ACH or wallet routing.</p>
            </div>
          </div>
          <div className="stack-sm">
            {report.paymentMethodBreakdown.map((item) => (
              <div key={item.label} className="summary-row">
                <span>{item.label}</span>
                <strong>
                  {item.value} payments | {formatCurrency(item.amount)}
                </strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ActivityTable
        transactions={report.transactions}
        title="Transaction table"
        description="Filtered transactions with payer, method, GL code, and status context."
      />
    </div>
  )
}
