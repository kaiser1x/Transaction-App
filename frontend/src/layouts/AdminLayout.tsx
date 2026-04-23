import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import type { ReactNode } from "react";

type AdminLayoutProps = {
  title: string;
  children: ReactNode;
};

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/payment-pages", label: "Payment Pages" },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const { logout, user } = useAuth0();
  const { pathname } = useLocation();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "240px",
          background: "#111827",
          color: "white",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>Wayspend</h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>Admin Portal</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                color: pathname === to ? "white" : "#9ca3af",
                background: pathname === to ? "#374151" : "transparent",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: pathname === to ? 600 : 400,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid #374151", paddingTop: "16px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email}
          </p>
          <button
            onClick={() => void logout({ logoutParams: { returnTo: window.location.origin + "/admin/login" } })}
            style={{
              width: "100%",
              padding: "8px",
              background: "transparent",
              color: "#9ca3af",
              border: "1px solid #374151",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "32px", background: "#f9fafb", overflow: "auto" }}>
        <h1 style={{ marginTop: 0, marginBottom: "24px", fontSize: "24px", fontWeight: 700, color: "#111827" }}>
          {title}
        </h1>
        {children}
      </main>
    </div>
  );
}
