import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pagesApi } from '../../api/pagesApi'
import BuilderForm from '../../components/admin/BuilderForm'
import PageHeader from '../../components/admin/PageHeader'
import PreviewPanel from '../../components/admin/PreviewPanel'
import LoadingState from '../../components/common/LoadingState'
import type { PaymentPage } from '../../types/paymentPage'
import { slugify } from '../../utils/formatters'

function createBlankPage(): PaymentPage {
  return {
    id: `draft-${crypto.randomUUID()}`,
    slug: 'new-payment-page',
    title: 'New payment page',
    subtitle: 'Secure online payment',
    description: 'Collect a payment with clear provider branding and trustworthy messaging.',
    organizationName: 'Wayspend Provider',
    brandColor: '#0b1f3a',
    logoUrl: '',
    headerMessage: 'Payments are securely routed and validated before confirmation.',
    footerMessage: 'Questions about your bill? Contact the provider team listed on your statement.',
    amountMode: 'fixed',
    fixedAmount: 125,
    minAmount: 25,
    maxAmount: 500,
    glCodes: ['PAYMENTS-1000'],
    isActive: true,
    customFields: [],
    lastUpdated: new Date().toISOString(),
  }
}

export default function PaymentPageEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState<PaymentPage | null>(null)

  useEffect(() => {
    if (!id) {
      setPage(createBlankPage())
      return
    }

    pagesApi.getById(id).then((existingPage) => setPage(existingPage ?? createBlankPage()))
  }, [id])

  const previewPage = useMemo(() => {
    if (!page) return null
    return {
      ...page,
      slug: slugify(page.slug || page.title) || 'payment-page',
    } satisfies PaymentPage
  }, [page])

  if (!previewPage) return <LoadingState title="Opening payment page builder..." />
  const resolvedPage: PaymentPage = previewPage

  async function savePage() {
    const pageToSave: PaymentPage = {
      ...resolvedPage,
      slug: slugify(resolvedPage.slug || resolvedPage.title) || 'payment-page',
    }
    const savedPage = await pagesApi.save(pageToSave)
    navigate(`/dashboard/payment-pages/${savedPage.id}/edit`)
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title={id ? 'Edit payment page' : 'Create payment page'}
        description="Configure a branded payment flow, distribution options, and live preview without leaving the editor."
      />
      <div className="editor-layout">
        <BuilderForm
          page={resolvedPage}
          onChange={(nextPage) => setPage(nextPage)}
          onSave={savePage}
          onCopy={async (value) => navigator.clipboard.writeText(value)}
        />
        <PreviewPanel page={resolvedPage} />
      </div>
    </div>
  )
}
