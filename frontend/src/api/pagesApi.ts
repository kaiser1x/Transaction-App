import type { ApiCustomField, ApiPaymentPage } from '../types/api'
import type { PaymentPage } from '../types/paymentPage'
import { createField, deleteField, listFields, updateField } from './fields'
import { createPage, deletePage, getPageBySlug, listPages, togglePage, updatePage, type PagePayload } from './pages'

function parseList(value: string[] | string | null | undefined) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value) as string[]
  } catch {
    return []
  }
}

function mapAmountMode(mode: ApiPaymentPage['amount_mode']): PaymentPage['amountMode'] {
  if (mode === 'fixed') return 'fixed'
  if (mode === 'min_max') return 'range'
  return 'open'
}

function toApiAmountMode(mode: PaymentPage['amountMode']): PagePayload['amount_mode'] {
  if (mode === 'fixed') return 'fixed'
  if (mode === 'range') return 'min_max'
  return 'user_entered'
}

function mapField(field: ApiCustomField): PaymentPage['customFields'][number] {
  return {
    id: field.id,
    label: field.label,
    fieldType: field.field_type,
    required: field.required,
    placeholder: field.placeholder ?? undefined,
    helperText: field.helper_text ?? undefined,
    options: parseList(field.options),
    order: field.display_order,
  }
}

function mapPage(page: ApiPaymentPage, fields: ApiCustomField[] = []): PaymentPage {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    description: page.description ?? undefined,
    brandColor: page.brand_color,
    logoUrl: page.logo_url ?? undefined,
    headerMessage: page.header_msg ?? undefined,
    footerMessage: page.footer_msg ?? undefined,
    amountMode: mapAmountMode(page.amount_mode),
    fixedAmount: page.fixed_amount ? Number(page.fixed_amount) : undefined,
    minAmount: page.min_amount ? Number(page.min_amount) : undefined,
    maxAmount: page.max_amount ? Number(page.max_amount) : undefined,
    glCodes: parseList(page.gl_codes),
    isActive: page.is_active,
    customFields: fields.map(mapField).sort((a, b) => a.order - b.order),
    lastUpdated: page.updated_at,
  }
}

function toPayload(page: PaymentPage): PagePayload {
  return {
    slug: page.slug,
    title: page.title,
    description: page.description,
    header_msg: page.headerMessage,
    footer_msg: page.footerMessage,
    brand_color: page.brandColor,
    logo_url: page.logoUrl,
    amount_mode: toApiAmountMode(page.amountMode),
    fixed_amount: page.amountMode === 'fixed' ? page.fixedAmount : undefined,
    min_amount: page.amountMode === 'range' ? page.minAmount : undefined,
    max_amount: page.amountMode === 'range' ? page.maxAmount : undefined,
    gl_codes: page.glCodes,
  }
}

export const pagesApi = {
  async list() {
    const pages = await listPages()
    return pages.map((page) => mapPage(page))
  },
  async getById(id: string) {
    const pages = await listPages()
    const page = pages.find((entry) => entry.id === id)
    if (!page) return null
    const fields = await listFields(id)
    return mapPage(page, fields)
  },
  async getBySlug(slug: string) {
    const page = await getPageBySlug(slug)
    return mapPage(page)
  },
  async save(page: PaymentPage) {
    const sortedFields = [...page.customFields].sort((a, b) => a.order - b.order)
    const payload = toPayload({ ...page, customFields: sortedFields })
    const isDraft = page.id.startsWith('draft-')
    let savedPage = isDraft ? await createPage(payload) : await updatePage(page.id, payload)
    const existingFields = isDraft ? [] : await listFields(savedPage.id)
    const existingFieldIds = new Set(existingFields.map((field) => field.id))
    const currentFieldIds = new Set(sortedFields.map((field) => field.id))

    await Promise.all(
      existingFields
        .filter((field) => !currentFieldIds.has(field.id))
        .map((field) => deleteField(savedPage.id, field.id)),
    )

    for (const [index, field] of sortedFields.entries()) {
      const fieldPayload = {
        label: field.label,
        field_type: field.fieldType,
        options: field.options,
        required: field.required,
        placeholder: field.placeholder,
        helper_text: field.helperText,
        display_order: index,
      }

      if (existingFieldIds.has(field.id)) {
        await updateField(savedPage.id, field.id, fieldPayload)
      } else {
        await createField(savedPage.id, fieldPayload)
      }
    }

    if (savedPage.is_active !== page.isActive) {
      savedPage = await togglePage(savedPage.id)
    }

    const refreshedFields = await listFields(savedPage.id)
    return mapPage(savedPage, refreshedFields)
  },
  async updateStatus(id: string, isActive: boolean) {
    const pages = await listPages()
    const page = pages.find((entry) => entry.id === id)
    if (!page) return
    if (page.is_active !== isActive) {
      await togglePage(id)
    }
  },
  async remove(id: string) {
    await deletePage(id)
  },
}
