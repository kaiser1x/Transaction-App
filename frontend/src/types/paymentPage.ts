// UI-layer types (used in forms / state — camelCase)

export type AmountMode = "fixed" | "min_max" | "user_entered";

export type CustomFieldType = "text" | "number" | "dropdown" | "date" | "checkbox";

export type CustomField = {
  id: string;
  label: string;
  field_type: CustomFieldType;
  required: boolean;
  placeholder?: string;
  helper_text?: string;
  options?: string[];
  display_order: number;
};

export type PaymentPage = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  brand_color: string;
  logo_url?: string;
  header_msg?: string;
  footer_msg?: string;
  amount_mode: AmountMode;
  fixed_amount?: number;
  min_amount?: number;
  max_amount?: number;
  gl_codes?: string[];
  email_template?: string;
  is_active: boolean;
};
