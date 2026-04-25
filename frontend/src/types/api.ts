// API response shapes - match the backend DB column names (snake_case)
type JsonStringList = string[] | string | null

export interface ApiPaymentPage {
  id: string
  slug: string
  title: string
  description: string | null
  header_msg: string | null
  footer_msg: string | null
  brand_color: string
  logo_url: string | null
  amount_mode: 'fixed' | 'min_max' | 'user_entered'
  fixed_amount: string | null
  min_amount: string | null
  max_amount: string | null
  gl_codes: JsonStringList
  email_template: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  custom_fields?: ApiCustomField[]
}

export interface ApiCustomField {
  id: string
  page_id: string
  label: string
  field_type: 'text' | 'number' | 'dropdown' | 'date' | 'checkbox'
  options: JsonStringList
  required: boolean
  placeholder: string | null
  helper_text: string | null
  display_order: number
}

export interface ApiTransaction {
  id: string
  page_id: string
  amount: string
  payment_method: 'credit_card' | 'ach' | 'wallet'
  status: 'pending' | 'success' | 'failed'
  stripe_intent_id: string | null
  payer_name: string | null
  payer_email: string | null
  gl_code: string | null
  created_at: string
}

export interface ApiReportSummary {
  total_count: number
  success_count: number
  failed_count: number
  pending_count: number
  total_collected: string
  avg_amount: string
}

export interface ApiReportByGl {
  gl_code: string | null
  count: number
  total: string
}

export interface ApiReportByMethod {
  payment_method: string
  count: number
  total: string
}
