import { useLocation } from "react-router-dom";

interface SuccessState {
  amount?: number;
  payerEmail?: string;
  title?: string;
}

export default function PaymentSuccessPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as SuccessState;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "48px 40px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          textAlign: "center",
          maxWidth: "440px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "28px",
          }}
        >
          ✓
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700, color: "#111827" }}>
          Payment Successful
        </h1>
        {state.title && (
          <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: "15px" }}>{state.title}</p>
        )}
        {state.amount !== undefined && (
          <p style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: 700, color: "#166534" }}>
            ${state.amount.toFixed(2)}
          </p>
        )}
        {state.payerEmail && (
          <p style={{ margin: "12px 0 0", color: "#6b7280", fontSize: "14px" }}>
            A receipt will be sent to <strong>{state.payerEmail}</strong>
          </p>
        )}
        <p style={{ margin: "24px 0 0", color: "#9ca3af", fontSize: "13px" }}>
          Thank you for your payment. You may close this window.
        </p>
      </div>
    </div>
  );
}
