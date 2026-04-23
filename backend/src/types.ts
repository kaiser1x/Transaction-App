import type { RowDataPacket } from "mysql2/promise";

export interface User extends RowDataPacket {
  id: string;
  auth0_id: string;
  email: string;
  name: string | null;
  role: "admin" | "payer";
  created_at: Date;
}

export interface PaymentPage extends RowDataPacket {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  header_msg: string | null;
  footer_msg: string | null;
  brand_color: string;
  logo_url: string | null;
  amount_mode: "fixed" | "min_max" | "user_entered";
  fixed_amount: string | null;
  min_amount: string | null;
  max_amount: string | null;
  gl_codes: string | null;
  email_template: string | null;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CustomField extends RowDataPacket {
  id: string;
  page_id: string;
  label: string;
  field_type: "text" | "number" | "dropdown" | "date" | "checkbox";
  options: string | null;
  required: boolean;
  placeholder: string | null;
  helper_text: string | null;
  display_order: number;
}

export interface Transaction extends RowDataPacket {
  id: string;
  page_id: string;
  amount: string;
  payment_method: "credit_card" | "ach" | "wallet";
  status: "pending" | "success" | "failed";
  stripe_intent_id: string | null;
  payer_name: string | null;
  payer_email: string | null;
  gl_code: string | null;
  created_at: Date;
}

export interface FieldResponse extends RowDataPacket {
  id: string;
  transaction_id: string;
  field_id: string;
  value: string | null;
}
