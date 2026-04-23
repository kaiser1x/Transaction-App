import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getSummary } from "../../api/reports";
import { listTransactions } from "../../api/reports";
import type { ApiReportSummary, ApiTransaction } from "../../types/api";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>{label}</p>
      <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "#111827" }}>{value}</p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>{sub}</p>}
    </div>
  );
}

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

export default function DashboardPage() {
  const [summary, setSummary] = useState<ApiReportSummary | null>(null);
  const [recent, setRecent] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([getSummary(), listTransactions()])
      .then(([s, txs]) => {
        setSummary(s);
        setRecent(txs.slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <p style={{ color: "#6b7280" }}>Loading...</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <StatCard
              label="Total Revenue"
              value={`$${Number(summary?.total_amount ?? 0).toFixed(2)}`}
            />
            <StatCard
              label="Transactions"
              value={summary?.total_transactions ?? 0}
            />
            <StatCard
              label="Successful"
              value={summary?.success_count ?? 0}
              sub={`${summary?.failed_count ?? 0} failed`}
            />
            <StatCard
              label="Pending"
              value={summary?.pending_count ?? 0}
            />
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                Recent Transactions
              </h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Date", "Payer", "Amount", "Method", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 24px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px 24px", textAlign: "center", color: "#9ca3af" }}>
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  recent.map((tx) => (
                    <tr key={tx.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 24px", fontSize: "14px", color: "#374151" }}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px 24px", fontSize: "14px", color: "#374151" }}>
                        {tx.payer_name ?? tx.payer_email ?? "—"}
                      </td>
                      <td style={{ padding: "12px 24px", fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                        ${Number(tx.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: "12px 24px", fontSize: "14px", color: "#374151", textTransform: "capitalize" }}>
                        {tx.payment_method.replace("_", " ")}
                      </td>
                      <td style={{ padding: "12px 24px" }}>
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
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
        </>
      )}
    </AdminLayout>
  );
}
