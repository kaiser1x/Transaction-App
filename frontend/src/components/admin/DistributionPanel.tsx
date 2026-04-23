import { Copy, Download, ScanLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { PaymentPage } from '../../types/paymentPage'
import { APP_ORIGIN } from '../../utils/constants'
import { publicPayRoute } from '../../utils/routeHelpers'
import Button from '../common/Button'

export default function DistributionPanel({
  page,
  onCopy,
}: {
  page: PaymentPage
  onCopy: (value: string) => void
}) {
  const publicUrl = `${APP_ORIGIN}${publicPayRoute(page.slug || 'new-page')}`
  const iframeSnippet = `<iframe src="${publicUrl}" title="${page.title || 'Wayspend payment'}" width="100%" height="960" style="border:0;border-radius:24px;"></iframe>`
  const [qrSvg, setQrSvg] = useState('')
  const [qrPng, setQrPng] = useState('')

  useEffect(() => {
    let alive = true

    void (async () => {
      const [svgMarkup, pngData] = await Promise.all([
        QRCode.toString(publicUrl, {
          type: 'svg',
          margin: 1,
          color: { dark: '#0b1f3a', light: '#ffffff' },
          width: 160,
        }),
        QRCode.toDataURL(publicUrl, {
          margin: 1,
          color: { dark: '#0b1f3a', light: '#ffffff' },
          width: 320,
        }),
      ])

      if (!alive) return
      setQrSvg(svgMarkup)
      setQrPng(pngData)
    })().catch(() => {
      if (!alive) return
      setQrSvg('')
      setQrPng('')
    })

    return () => {
      alive = false
    }
  }, [publicUrl])

  const qrSvgUrl = qrSvg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}` : ''

  return (
    <div className="stack-md">
      <div className="distribution-box stack-sm">
        <strong>Public URL</strong>
        <div className="split-row">
          <code className="mono">{publicUrl}</code>
          <Button variant="secondary" onClick={() => onCopy(publicUrl)}>
            <Copy size={16} aria-hidden="true" />
            Copy
          </Button>
        </div>
      </div>
      <div className="distribution-box stack-sm">
        <strong>Embed snippet</strong>
        <code className="mono">{iframeSnippet}</code>
        <Button variant="ghost" onClick={() => onCopy(iframeSnippet)}>
          <ScanLine size={16} aria-hidden="true" />
          Copy iframe
        </Button>
      </div>
      <div className="distribution-box split-row">
        <div className="stack-sm">
          <strong>QR code</strong>
          <p className="muted-text">Scan to open the live Quick Payment Page from printouts, kiosks, or in-office signage.</p>
          <div className="action-row">
            {qrPng ? (
              <a href={qrPng} download={`${page.slug || 'payment-page'}-qr.png`}>
                <Button variant="secondary">
                  <Download size={16} aria-hidden="true" />
                  PNG
                </Button>
              </a>
            ) : null}
            {qrSvgUrl ? (
              <a href={qrSvgUrl} download={`${page.slug || 'payment-page'}-qr.svg`}>
                <Button variant="ghost">
                  <Download size={16} aria-hidden="true" />
                  SVG
                </Button>
              </a>
            ) : null}
          </div>
        </div>
        <div className="qr-placeholder qr-live">
          {qrSvg ? (
            <div
              aria-label={`QR code for ${page.title || 'Wayspend payment page'}`}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : (
            <span className="muted-text">Generating QR…</span>
          )}
        </div>
      </div>
    </div>
  )
}
