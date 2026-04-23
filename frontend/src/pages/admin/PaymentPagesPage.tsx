import { CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { pagesApi } from '../../api/pagesApi'
import PageHeader from '../../components/admin/PageHeader'
import PaymentPageCard from '../../components/admin/PaymentPageCard'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import SearchBar from '../../components/common/SearchBar'
import type { PaymentPage } from '../../types/paymentPage'

export default function PaymentPagesPage() {
  const [pages, setPages] = useState<PaymentPage[]>([])
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    pagesApi.list().then(setPages)
  }, [])

  const filteredPages = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return pages
    return pages.filter((page) =>
      [page.title, page.slug, page.organizationName, page.subtitle].join(' ').toLowerCase().includes(normalized),
    )
  }, [pages, query])

  async function copyValue(value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(value)
    window.setTimeout(() => setCopied(''), 1800)
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="Payment pages"
        description="Create and manage reusable branded payment pages for balances, deposits, and flexible collections."
        actions={
          <Link to="/dashboard/payment-pages/new">
            <Button>Create new page</Button>
          </Link>
        }
      />

      <div className="split-row">
        <SearchBar
          placeholder="Search by title, provider, or slug"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {copied ? (
          <div className="badge badge-success">
            <CheckCircle2 size={16} aria-hidden="true" />
            Copied to clipboard
          </div>
        ) : null}
      </div>

      <div className="stack-md">
        {filteredPages.length > 0 ? (
          filteredPages.map((page) => <PaymentPageCard key={page.id} page={page} onCopy={copyValue} />)
        ) : (
          <EmptyState
            title="No payment pages found"
            message="Try a different search or create a new branded page for your payment flow."
            action={
              <Link to="/dashboard/payment-pages/new">
                <Button>Create page</Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}
