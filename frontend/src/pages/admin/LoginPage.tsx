import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void navigate("/admin/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "48px",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px", color: "#111827" }}>
          Wayspend
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "32px", fontSize: "15px" }}>
          Admin Portal — Payment Pages
        </p>
        <button
          onClick={() => void loginWithRedirect()}
          style={{
            width: "100%",
            padding: "12px",
            background: "#1a56db",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sign in with Auth0
        </button>
      </div>
    </div>
  );
}
