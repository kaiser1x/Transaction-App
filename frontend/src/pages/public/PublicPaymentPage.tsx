import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getPageBySlug } from "../../api/pages";
import { listFields } from "../../api/fields";
import { createPaymentIntent, confirmPayment } from "../../api/payments";
import type { ApiPaymentPage, ApiCustomField } from "../../types/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// ---------- Custom field renderer ----------

function CustomFieldInput({
  field,
  value,
  onChange,
}: {
  field: ApiCustomField;
  value: string;
  onChange: (v: string) => void;
}) {
  const base: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  if (field.field_type === "checkbox") {
    return (
      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
        />
        {field.label}
        {field.required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
    );
  }

  if (field.field_type === "dropdown") {
    const options: string[] = field.options ? (JSON.parse(field.options) as string[]) : [];
    return (
      <select style={base} value={value} onChange={(e) => onChange(e.target.value)} required={field.required}>
        <option value="">{field.placeholder ?? "Select..."}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      style={base}
      type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder ?? ""}
      required={field.required}
    />
  );
}

// ---------- Checkout form (needs Stripe context) ----------

function CheckoutForm({
  page,
  fields,
  amount,
  payerName,
  payerEmail,
  fieldValues,
}: {
  page: ApiPaymentPage;
  fields: ApiCustomField[];
  amount: number;
  payerName: string;
  payerEmail: string;
  fieldValues: Record<string, string>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin + "/payment/success" },
        redirect: "if_required",
      });

      if (result.error) {
        setError(result.error.message ?? "Payment failed");
        return;
      }

      const intentId = result.paymentIntent?.id ?? "";
      await confirmPayment({
        stripeIntentId: intentId,
        pageId: page.id,
        amount,
        paymentMethod: "credit_card",
        payerName: payerName || undefined,
        payerEmail: payerEmail || undefined,
        fieldResponses: fields.map((f) => ({
          fieldId: f.id,
          value: fieldValues[f.id] ?? "",
        })),
      });

      void navigate("/payment/success", {
        state: { amount, payerEmail, title: page.title },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <p style={{ margin: "12px 0 0", color: "#dc2626", fontSize: "14px" }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "13px",
          background: submitting ? "#93c5fd" : page.brand_color,
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: 700,
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

// ---------- Main page ----------

export default function PublicPaymentPage() {
  const { slug } = useParams<{ slug: string }>();

  const [page, setPage] = useState<ApiPaymentPage | null>(null);
  const [fields, setFields] = useState<ApiCustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [amount, setAmount] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      try {
        const p = await getPageBySlug(slug);
        setPage(p);
        const f = await listFields(p.id);
        setFields(f);
        if (p.amount_mode === "fixed" && p.fixed_amount) {
          setAmount(p.fixed_amount);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  async function handleProceed(e: React.FormEvent) {
    e.preventDefault();
    if (!page) return;
    setCreatingIntent(true);
    setIntentError(null);
    try {
      const { clientSecret: cs } = await createPaymentIntent({
        pageId: page.id,
        amount: Number(amount),
        payerEmail: payerEmail || undefined,
        payerName: payerName || undefined,
      });
      setClientSecret(cs);
    } catch (err) {
      setIntentError(err instanceof Error ? err.message : "Could not start payment");
    } finally {
      setCreatingIntent(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "80px" }}>
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "80px" }}>
        <h2 style={{ color: "#111827" }}>Page not found</h2>
        <p style={{ color: "#6b7280" }}>This payment page doesn't exist or is no longer active.</p>
      </div>
    );
  }

  const resolvedAmount = Number(amount);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "40px 16px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          {page.logo_url && (
            <img
              src={page.logo_url}
              alt="Logo"
              style={{ height: "48px", marginBottom: "12px", objectFit: "contain" }}
            />
          )}
          <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700, color: "#111827" }}>
            {page.title}
          </h1>
          {page.description && (
            <p style={{ margin: 0, color: "#6b7280", fontSize: "15px" }}>{page.description}</p>
          )}
          {page.header_msg && (
            <p style={{ margin: "12px 0 0", color: "#374151", fontSize: "14px", fontStyle: "italic" }}>
              {page.header_msg}
            </p>
          )}
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {!clientSecret ? (
            <form onSubmit={(e) => void handleProceed(e)}>
              {/* Amount */}
              {page.amount_mode !== "fixed" && (
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    min={page.amount_mode === "min_max" ? String(page.min_amount) : "0.01"}
                    max={page.amount_mode === "min_max" ? String(page.max_amount) : undefined}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder={
                      page.amount_mode === "min_max"
                        ? `$${Number(page.min_amount).toFixed(2)} – $${Number(page.max_amount).toFixed(2)}`
                        : "Enter amount"
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "20px",
                      fontWeight: 600,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              {page.amount_mode === "fixed" && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    background: "#f0f9ff",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <span style={{ fontSize: "32px", fontWeight: 700, color: page.brand_color }}>
                    ${Number(page.fixed_amount).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Payer info */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Name
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Full name"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>

              {/* Custom fields */}
              {fields.map((f) => (
                <div key={f.id} style={{ marginBottom: "16px" }}>
                  {f.field_type !== "checkbox" && (
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      {f.label}
                      {f.required && <span style={{ color: "#dc2626" }}> *</span>}
                    </label>
                  )}
                  <CustomFieldInput
                    field={f}
                    value={fieldValues[f.id] ?? ""}
                    onChange={(v) => setFieldValues((prev) => ({ ...prev, [f.id]: v }))}
                  />
                  {f.helper_text && (
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>{f.helper_text}</p>
                  )}
                </div>
              ))}

              {intentError && (
                <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "12px" }}>{intentError}</p>
              )}

              <button
                type="submit"
                disabled={creatingIntent}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: creatingIntent ? "#93c5fd" : page.brand_color,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: creatingIntent ? "not-allowed" : "pointer",
                }}
              >
                {creatingIntent ? "Please wait..." : "Continue to Payment"}
              </button>
            </form>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: "stripe" } }}
            >
              <div style={{ marginBottom: "20px" }}>
                <button
                  type="button"
                  onClick={() => setClientSecret(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: 0,
                    marginBottom: "16px",
                  }}
                >
                  ← Back
                </button>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Payment amount</p>
                  <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 700, color: page.brand_color }}>
                    ${resolvedAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              <CheckoutForm
                page={page}
                fields={fields}
                amount={resolvedAmount}
                payerName={payerName}
                payerEmail={payerEmail}
                fieldValues={fieldValues}
              />
            </Elements>
          )}
        </div>

        {page.footer_msg && (
          <p style={{ textAlign: "center", marginTop: "20px", color: "#9ca3af", fontSize: "13px" }}>
            {page.footer_msg}
          </p>
        )}

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#d1d5db" }}>
          Secured by Stripe
        </p>
      </div>
    </div>
  );
}
