import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { listPages, togglePage, deletePage } from "../../api/pages";
import type { ApiPaymentPage } from "../../types/api";

export default function PaymentPagesPage() {
  const [pages, setPages] = useState<ApiPaymentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listPages()
      .then(setPages)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(id: string) {
    try {
      const updated = await togglePage(id);
      setPages((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to toggle");
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deletePage(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  const amountLabel = (page: ApiPaymentPage) => {
    if (page.amount_mode === "fixed") return `$${Number(page.fixed_amount).toFixed(2)}`;
    if (page.amount_mode === "min_max")
      return `$${Number(page.min_amount).toFixed(2)} – $${Number(page.max_amount).toFixed(2)}`;
    return "Open amount";
  };

  return (
    <AdminLayout title="Payment Pages">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <Link to="/admin/payment-pages/new" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "10px 20px",
              background: "#1a56db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            + Create Page
          </button>
        </Link>
      </div>

      {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {!loading && !error && pages.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 0",
            color: "#9ca3af",
            background: "white",
            borderRadius: "12px",
          }}
        >
          <p style={{ fontSize: "18px", marginBottom: "8px" }}>No payment pages yet</p>
          <p style={{ fontSize: "14px" }}>Create your first page to get started.</p>
        </div>
      )}

      <div style={{ display: "grid", gap: "12px" }}>
        {pages.map((page) => (
          <div
            key={page.id}
            style={{
              padding: "20px 24px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              background: "white",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: page.brand_color,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                  {page.title}
                </h3>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: page.is_active ? "#dcfce7" : "#f3f4f6",
                    color: page.is_active ? "#166534" : "#6b7280",
                  }}
                >
                  {page.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                /pay/{page.slug} · {amountLabel(page)}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button
                onClick={() => void handleToggle(page.id)}
                style={{
                  padding: "7px 14px",
                  background: "transparent",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#374151",
                }}
              >
                {page.is_active ? "Disable" : "Enable"}
              </button>
              <Link to={`/admin/payment-pages/${page.id}/edit`} style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "7px 14px",
                    background: "#1a56db",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  Edit
                </button>
              </Link>
              <button
                onClick={() => void handleDelete(page.id, page.title)}
                style={{
                  padding: "7px 14px",
                  background: "transparent",
                  border: "1px solid #fca5a5",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#dc2626",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
