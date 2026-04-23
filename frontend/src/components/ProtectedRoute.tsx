import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { setTokenGetter } from "../api/client";
import { syncUser } from "../api/auth";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently, user } =
    useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    if (isAuthenticated) {
      setTokenGetter(getAccessTokenSilently);
      if (user?.email) {
        syncUser(user.email, user.name ?? null).catch(console.error);
      }
    }
  }, [isAuthenticated, getAccessTokenSilently, user]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
