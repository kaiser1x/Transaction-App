import { useLocation, useNavigate } from "react-router-dom";

interface ErrorState {
  message?: string;
  slug?: string;
}

export default function PaymentErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as ErrorState;

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
            background: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "28px",
          }}
        >
          ✕
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700, color: "#111827" }}>
          Payment Failed
        </h1>
        <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: "15px" }}>
          {state.message ?? "Something went wrong while processing your payment."}
        </p>
        {state.slug ? (
          <button
            onClick={() => void navigate(`/pay/${state.slug}`)}
            style={{
              padding: "11px 28px",
              background: "#1a56db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Try Again
          </button>
        ) : (
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "11px 28px",
              background: "#1a56db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Go Back
          </button>
        )}
        <p style={{ margin: "20px 0 0", color: "#9ca3af", fontSize: "13px" }}>
          Your card has not been charged. Please try again or contact support.
        </p>
      </div>
    </div>
  );
}
