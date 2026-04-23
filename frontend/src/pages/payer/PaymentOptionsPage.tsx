import { ArrowRight, ExternalLink } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { payerApi } from '../../api/payerApi'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import SearchBar from '../../components/common/SearchBar'
import StatusPill from '../../components/common/StatusPill'
import type { PaymentPage } from '../../types/paymentPage'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { publicPayRoute } from '../../utils/routeHelpers'

function amountLabel(page: PaymentPage) {
  if (page.amountMode === 'fixed' && page.fixedAmount != null) return formatCurrency(page.fixedAmount)
  if (page.amountMode === 'range' && page.minAmount != null && page.maxAmount != null) {
    return `${formatCurrency(page.minAmount)} - ${formatCurrency(page.maxAmount)}`
  }
  return 'Enter your amount'
}

export default function PaymentOptionsPage() {
  const [pages, setPages] = useState<PaymentPage[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    payerApi.listPaymentOptions().then(setPages)
  }, [])

  const filteredPages = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return pages
    return pages.filter((page) => [page.title, page.slug, page.description].join(' ').toLowerCase().includes(normalized))
  }, [pages, query])

  return (
    <div className="stack-lg">
      <PageHeader
        title="Quick payment pages"
        description="Open a live payment page, complete a Stripe sandbox payment, and keep the admin portal out of the payer demo path."
      />

      <SearchBar
        placeholder="Search payment pages by title or slug"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="stack-md">
        {filteredPages.length > 0 ? (
          filteredPages.map((page) => (
            <Card key={page.id} padded={false}>
              <div className="list-card">
                <div className="stack-sm">
                  <div className="split-row">
                    <h3 className="card-title" style={{ margin: 0 }}>
                      {page.title}
                    </h3>
                    <StatusPill status="active" />
                  </div>
                  <p className="card-subtitle">
                    {page.description ?? page.headerMessage ?? 'Secure payer checkout flow'}
                  </p>
                  <div className="list-metadata muted-text">
                    <span className="badge badge-neutral mono">/{page.slug}</span>
                    <span>{amountLabel(page)}</span>
                    <span>Updated {page.lastUpdated ? formatDateTime(page.lastUpdated) : 'recently'}</span>
                  </div>
                </div>
                <div className="action-row">
                  <Link to={publicPayRoute(page.slug)}>
                    <Button>
                      Start payment
                      <ArrowRight size={16} aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link to={publicPayRoute(page.slug)} target="_blank" rel="noreferrer">
                    <Button variant="ghost">
                      Preview
                      <ExternalLink size={16} aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState
            title="No payment options available"
            message="There are no active payment pages for your workspace yet. Check back after an administrator publishes one."
          />
        )}
      </div>
    </div>
  )
}
