import { api } from "./client";

export interface IntentResponse {
  clientSecret: string;
  intentId: string;
}

export interface ConfirmPayload {
  stripeIntentId: string;
  pageId: string;
  amount: number;
  paymentMethod: "credit_card" | "ach" | "wallet";
  payerName?: string;
  payerEmail?: string;
  glCode?: string;
  fieldResponses?: { fieldId: string; value: string }[];
}

export interface ConfirmResponse {
  transactionId: string;
  status: "pending" | "success" | "failed";
  receiptEmailSent?: boolean;
  receiptEmail?: string | null;
}

export function createPaymentIntent(payload: {
  pageId: string;
  amount: number;
  payerEmail?: string;
  payerName?: string;
}) {
  return api.post<IntentResponse>("/api/payments/intent", payload);
}

export function confirmPayment(payload: ConfirmPayload) {
  return api.post<ConfirmResponse>("/api/payments/confirm", payload);
}
