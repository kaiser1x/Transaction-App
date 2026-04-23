import { Save } from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { AmountMode, PaymentPage } from '../../types/paymentPage'
import Button from '../common/Button'
import Checkbox from '../common/Checkbox'
import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import CustomFieldsEditor from './CustomFieldsEditor'
import DistributionPanel from './DistributionPanel'

type BuilderFormProps = {
  page: PaymentPage
  onChange: (nextPage: PaymentPage) => void
  onSave: () => void
  onCopy: (value: string) => void
}

function updateStringList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function BuilderForm({ page, onChange, onSave, onCopy }: BuilderFormProps) {
  const updateField =
    <K extends keyof PaymentPage>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const nextValue = event.target.value
      const parsedValue =
        key === 'fixedAmount' || key === 'minAmount' || key === 'maxAmount'
          ? Number(nextValue) || 0
          : key === 'isActive'
            ? (event.target as HTMLInputElement).checked
            : nextValue

      onChange({ ...page, [key]: parsedValue })
    }

  const setAmountMode = (amountMode: AmountMode) => {
    onChange({ ...page, amountMode })
  }

  return (
    <div className="builder-sections">
      <div className="form-section stack-md">
        <div className="split-row">
          <div>
            <h3>General</h3>
            <p className="muted-text">Define the payer-facing identity, page slug, and descriptive copy.</p>
          </div>
          <Button onClick={onSave}>
            <Save size={16} aria-hidden="true" />
            Save page
          </Button>
        </div>
        <div className="form-grid-2">
          <Input label="Page title" value={page.title} onChange={updateField('title')} />
          <Input label="Public slug" value={page.slug} onChange={updateField('slug')} helperText="Unique URL path" />
        </div>
        <Input label="Provider name" value={page.organizationName ?? ''} onChange={updateField('organizationName')} />
        <Input label="Subtitle" value={page.subtitle ?? ''} onChange={updateField('subtitle')} />
        <Textarea label="Description" value={page.description ?? ''} onChange={updateField('description')} />
      </div>

      <div className="form-section stack-md">
        <div>
          <h3>Branding</h3>
          <p className="muted-text">Keep the public page familiar, branded, and reassuring.</p>
        </div>
        <div className="form-grid-2">
          <Input label="Logo URL" value={page.logoUrl ?? ''} onChange={updateField('logoUrl')} />
          <Input label="Brand color" type="color" value={page.brandColor} onChange={updateField('brandColor')} />
        </div>
        <Textarea label="Header message" value={page.headerMessage ?? ''} onChange={updateField('headerMessage')} />
        <Textarea label="Footer message" value={page.footerMessage ?? ''} onChange={updateField('footerMessage')} />
      </div>

      <div className="form-section stack-md">
        <div>
          <h3>Amount configuration</h3>
          <p className="muted-text">Support fixed balances, guided ranges, or open-amount collection.</p>
        </div>
        <Select
          label="Amount mode"
          value={page.amountMode}
          onChange={(event) => setAmountMode(event.target.value as AmountMode)}
          options={[
            { label: 'Fixed', value: 'fixed' },
            { label: 'Range', value: 'range' },
            { label: 'Open', value: 'open' },
          ]}
        />
        {page.amountMode === 'fixed' ? (
          <Input label="Fixed amount" type="number" min="0" step="0.01" value={page.fixedAmount ?? 0} onChange={updateField('fixedAmount')} />
        ) : null}
        {page.amountMode === 'range' ? (
          <div className="form-grid-2">
            <Input label="Minimum amount" type="number" min="0" step="0.01" value={page.minAmount ?? 0} onChange={updateField('minAmount')} />
            <Input label="Maximum amount" type="number" min="0" step="0.01" value={page.maxAmount ?? 0} onChange={updateField('maxAmount')} />
          </div>
        ) : null}
      </div>

      <div className="form-section stack-md">
        <div>
          <h3>Custom fields</h3>
          <p className="muted-text">Collect statement metadata, payer confirmations, and optional intake details.</p>
        </div>
        <CustomFieldsEditor fields={page.customFields} onChange={(customFields) => onChange({ ...page, customFields })} />
      </div>

      <div className="form-section stack-md">
        <div>
          <h3>GL codes</h3>
          <p className="muted-text">Display or route collected payments into accounting buckets.</p>
        </div>
        <Input
          label="GL codes"
          helperText="Comma-separated values"
          value={page.glCodes?.join(', ') ?? ''}
          onChange={(event) => onChange({ ...page, glCodes: updateStringList(event.target.value) })}
        />
      </div>

      <div className="form-section stack-md">
        <div>
          <h3>Distribution</h3>
          <p className="muted-text">Share the public URL, embed the page, or display a QR handoff area.</p>
        </div>
        <DistributionPanel page={page} onCopy={onCopy} />
      </div>

      <div className="form-section stack-md">
        <div>
          <h3>Availability</h3>
          <p className="muted-text">Control whether the public payer flow stays live or routes to the disabled state.</p>
        </div>
        <Checkbox
          label="Page is active"
          checked={page.isActive}
          onChange={(event) => onChange({ ...page, isActive: event.target.checked })}
        />
        {!page.isActive ? (
          <Textarea
            label="Disabled reason"
            value={page.disabledReason ?? ''}
            onChange={(event) => onChange({ ...page, disabledReason: event.target.value })}
          />
        ) : null}
      </div>
    </div>
  )
}
