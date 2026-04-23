import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { listTransactions, getSummary, getByGl, getByMethod, downloadCsv } from "../../api/reports";
import { listPages } from "../../api/pages";
import type { ApiTransaction, ApiReportSummary, ApiReportByGl, ApiReportByMethod } from "../../types/api";
import type { ApiPaymentPage } from "../../types/api";
import type { TransactionFilters } from "../../api/reports";

const statusColors: Record<string, string> = {
  success: "#dcfce7",
  failed: "#fee2e2",
  pending: "#fef9c3",
};
const statusText: Record<string, string> = {
  success: "#166534",
  failed: "#991b1b",
  pending: "#854d0e",
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "13px",
};

export default function ReportsPage() {
  const [pages, setPages] = useState<ApiPaymentPage[]>([]);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [summary, setSummary] = useState<ApiReportSummary | null>(null);
  const [byGl, setByGl] = useState<ApiReportByGl[]>([]);
  const [byMethod, setByMethod] = useState<ApiReportByMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const [pageId, setPageId] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filters: TransactionFilters = {
    pageId: pageId || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
  };

  const load = useCallback(() => {
    setLoading(true);
    void Promise.all([
      listTransactions(filters),
      getSummary(filters),
      getByGl(filters),
      getByMethod(filters),
    ])
      .then(([txs, sum, gl, method]) => {
        setTransactions(txs);
        setSummary(sum);
        setByGl(gl);
        setByMethod(method);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, status, from, to]);

  useEffect(() => {
    void listPages().then(setPages).catch(() => null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout title="Reports">
      {/* Filters */}
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
            Page
          </label>
          <select style={inputStyle} value={pageId} onChange={(e) => setPageId(e.target.value)}>
            <option value="">All Pages</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
            Status
          </label>
          <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
            From
          </label>
          <input type="date" style={inputStyle} value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
            To
          </label>
          <input type="date" style={inputStyle} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button
          onClick={() => void downloadCsv(filters)}
          style={{
            padding: "8px 16px",
            background: "#1a56db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Export CSV
        </button>
      </div>

      {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}

      {!loading && (
        <>
          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "Total Revenue", value: `$${Number(summary?.total_amount ?? 0).toFixed(2)}` },
              { label: "Transactions", value: summary?.total_transactions ?? 0 },
              { label: "Successful", value: summary?.success_count ?? 0 },
              { label: "Failed", value: summary?.failed_count ?? 0 },
              { label: "Pending", value: summary?.pending_count ?? 0 },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>{label}</p>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* By method + by GL side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "#111827" }}>By Payment Method</h3>
              {byMethod.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "13px" }}>No data</p>
              ) : (
                byMethod.map((row) => (
                  <div key={row.payment_method} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px" }}>
                    <span style={{ textTransform: "capitalize", color: "#374151" }}>{row.payment_method.replace("_", " ")}</span>
                    <span style={{ fontWeight: 600, color: "#111827" }}>{row.count} · ${Number(row.total).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "#111827" }}>By GL Code</h3>
              {byGl.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "13px" }}>No data</p>
              ) : (
                byGl.map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px" }}>
                    <span style={{ color: "#374151" }}>{row.gl_code ?? "—"}</span>
                    <span style={{ fontWeight: 600, color: "#111827" }}>{row.count} · ${Number(row.total).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transactions table */}
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                Transactions ({transactions.length})
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Date", "Payer", "Amount", "Method", "GL Code", "Status"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af" }}>
                        No transactions match the selected filters
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "11px 16px", fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: "13px", color: "#374151" }}>
                          <div>{tx.payer_name ?? "—"}</div>
                          {tx.payer_email && (
                            <div style={{ fontSize: "12px", color: "#9ca3af" }}>{tx.payer_email}</div>
                          )}
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                          ${Number(tx.amount).toFixed(2)}
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: "13px", color: "#374151", textTransform: "capitalize" }}>
                          {tx.payment_method.replace("_", " ")}
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: "13px", color: "#374151" }}>
                          {tx.gl_code ?? "—"}
                        </td>
                        <td style={{ padding: "11px 16px" }}>
                          <span
                            style={{
                              padding: "2px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 600,
                              background: statusColors[tx.status] ?? "#f3f4f6",
                              color: statusText[tx.status] ?? "#374151",
                            }}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
