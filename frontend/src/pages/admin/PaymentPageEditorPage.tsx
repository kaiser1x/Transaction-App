import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { listPages, createPage, updatePage } from "../../api/pages";
import { listFields, createField, updateField, deleteField } from "../../api/fields";
import type { ApiCustomField } from "../../types/api";
import type { PagePayload } from "../../api/pages";
import type { FieldPayload } from "../../api/fields";

type AmountMode = "fixed" | "min_max" | "user_entered";
type FieldType = "text" | "number" | "dropdown" | "date" | "checkbox";

interface FieldDraft extends Partial<ApiCustomField> {
  _new?: boolean;
  _dirty?: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 600, color: "#111827" }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function PaymentPageEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [pageId, setPageId] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldDraft[]>([]);

  // Form state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [headerMsg, setHeaderMsg] = useState("");
  const [footerMsg, setFooterMsg] = useState("");
  const [brandColor, setBrandColor] = useState("#1a56db");
  const [logoUrl, setLogoUrl] = useState("");
  const [amountMode, setAmountMode] = useState<AmountMode>("user_entered");
  const [fixedAmount, setFixedAmount] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  useEffect(() => {
    if (!isEdit || !id) return;

    // id param is the page UUID when editing
    void (async () => {
      try {
        const all = await listPages();
        const page = all.find((p) => p.id === id);
        if (!page) return;
        setPageId(page.id);
        setSlug(page.slug);
        setTitle(page.title);
        setDescription(page.description ?? "");
        setHeaderMsg(page.header_msg ?? "");
        setFooterMsg(page.footer_msg ?? "");
        setBrandColor(page.brand_color);
        setLogoUrl(page.logo_url ?? "");
        setAmountMode(page.amount_mode);
        setFixedAmount(page.fixed_amount ?? "");
        setMinAmount(page.min_amount ?? "");
        setMaxAmount(page.max_amount ?? "");

        const loaded = await listFields(page.id);
        setFields(loaded);
      } finally {
        setLoadingPage(false);
      }
    })();
  }, [id, isEdit]);

  function addField() {
    setFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "",
        field_type: "text" as FieldType,
        required: false,
        placeholder: "",
        helper_text: "",
        display_order: prev.length,
        _new: true,
        _dirty: true,
      },
    ]);
  }

  function updateFieldDraft(idx: number, patch: Partial<FieldDraft>) {
    setFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, ...patch, _dirty: true } : f))
    );
  }

  async function removeField(idx: number) {
    const field = fields[idx];
    if (!field) return;
    if (!field._new && pageId && field.id) {
      await deleteField(pageId, field.id);
    }
    setFields((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: PagePayload = {
        slug,
        title,
        description: description || undefined,
        header_msg: headerMsg || undefined,
        footer_msg: footerMsg || undefined,
        brand_color: brandColor,
        logo_url: logoUrl || undefined,
        amount_mode: amountMode,
        fixed_amount: fixedAmount ? Number(fixedAmount) : undefined,
        min_amount: minAmount ? Number(minAmount) : undefined,
        max_amount: maxAmount ? Number(maxAmount) : undefined,
      };

      let savedId = pageId;
      if (isEdit && pageId) {
        await updatePage(pageId, payload);
      } else {
        const created = await createPage(payload);
        savedId = created.id;
        setPageId(created.id);
      }

      if (savedId) {
        for (let i = 0; i < fields.length; i++) {
          const f = fields[i];
          if (!f._dirty) continue;
          const fp: FieldPayload = {
            label: f.label ?? "",
            field_type: (f.field_type ?? "text") as FieldType,
            required: f.required ?? false,
            placeholder: f.placeholder ?? undefined,
            helper_text: f.helper_text ?? undefined,
            display_order: i,
          };
          if (f._new) {
            await createField(savedId, fp);
          } else if (f.id) {
            await updateField(savedId, f.id, fp);
          }
        }
      }

      void navigate("/admin/payment-pages");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loadingPage) {
    return (
      <AdminLayout title="Edit Page">
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Edit Page" : "New Payment Page"}>
      <form onSubmit={(e) => void handleSubmit(e)} style={{ maxWidth: "720px" }}>
        <Section title="Basic Info">
          <Field label="Title *">
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. St. Luke's Co-Pay"
            />
          </Field>
          <Field label="Slug * (URL path)">
            <input
              style={inputStyle}
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              required
              placeholder="e.g. stlukes-copay"
            />
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>
              Public URL: /pay/{slug || "your-slug"}
            </p>
          </Field>
          <Field label="Description">
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description shown on the payment page"
            />
          </Field>
        </Section>

        <Section title="Branding">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Brand Color">
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  style={{ width: "48px", height: "36px", padding: "2px", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer" }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                />
              </div>
            </Field>
            <Field label="Logo URL">
              <input
                style={inputStyle}
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>
          <Field label="Header Message">
            <input
              style={inputStyle}
              value={headerMsg}
              onChange={(e) => setHeaderMsg(e.target.value)}
              placeholder="Displayed above the payment form"
            />
          </Field>
          <Field label="Footer Message">
            <input
              style={inputStyle}
              value={footerMsg}
              onChange={(e) => setFooterMsg(e.target.value)}
              placeholder="Displayed below the payment form"
            />
          </Field>
        </Section>

        <Section title="Amount">
          <Field label="Amount Mode">
            <select
              style={inputStyle}
              value={amountMode}
              onChange={(e) => setAmountMode(e.target.value as AmountMode)}
            >
              <option value="fixed">Fixed — one set amount</option>
              <option value="min_max">Range — min to max</option>
              <option value="user_entered">Open — payer enters amount</option>
            </select>
          </Field>
          {amountMode === "fixed" && (
            <Field label="Fixed Amount ($)">
              <input
                style={inputStyle}
                type="number"
                min="0.01"
                step="0.01"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
                required
              />
            </Field>
          )}
          {amountMode === "min_max" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Minimum ($)">
                <input
                  style={inputStyle}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  required
                />
              </Field>
              <Field label="Maximum ($)">
                <input
                  style={inputStyle}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  required
                />
              </Field>
            </div>
          )}
        </Section>

        <Section title="Custom Fields">
          {fields.map((f, idx) => (
            <div
              key={f.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
                background: "#f9fafb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                  Field {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => void removeField(idx)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Remove
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Label *</label>
                  <input
                    style={inputStyle}
                    value={f.label ?? ""}
                    onChange={(e) => updateFieldDraft(idx, { label: e.target.value })}
                    required
                    placeholder="e.g. Patient Name"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    style={inputStyle}
                    value={f.field_type ?? "text"}
                    onChange={(e) => updateFieldDraft(idx, { field_type: e.target.value as FieldType })}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="date">Date</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Placeholder</label>
                  <input
                    style={inputStyle}
                    value={f.placeholder ?? ""}
                    onChange={(e) => updateFieldDraft(idx, { placeholder: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Helper Text</label>
                  <input
                    style={inputStyle}
                    value={f.helper_text ?? ""}
                    onChange={(e) => updateFieldDraft(idx, { helper_text: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ marginTop: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#374151" }}>
                  <input
                    type="checkbox"
                    checked={f.required ?? false}
                    onChange={(e) => updateFieldDraft(idx, { required: e.target.checked })}
                  />
                  Required field
                </label>
              </div>
            </div>
          ))}

          {fields.length < 10 && (
            <button
              type="button"
              onClick={addField}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px dashed #d1d5db",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                color: "#6b7280",
                width: "100%",
              }}
            >
              + Add Field
            </button>
          )}
        </Section>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "11px 28px",
              background: saving ? "#93c5fd" : "#1a56db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "15px",
            }}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Page"}
          </button>
          <button
            type="button"
            onClick={() => void navigate("/admin/payment-pages")}
            style={{
              padding: "11px 28px",
              background: "transparent",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              color: "#374151",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
