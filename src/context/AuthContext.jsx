import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/apiFetch";
import { clearAuthToken } from "../lib/authToken";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(
    async ({ silent = false, retries = 0, retryDelayMs = 150 } = {}) => {
      let lastStatus = null;

      if (!silent) {
        setLoading(true);
      }

      try {
        for (let attempt = 0; attempt <= retries; attempt += 1) {
          const res = await apiFetch("/api/auth/me", { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            return data;
          }

          lastStatus = res.status;

          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
          }
        }
      } catch {
        // no-op: handled below by clearing user
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }

      if (lastStatus === 401 || lastStatus === 403) {
        clearAuthToken();
      }

      setUser(null);
      return null;
    },
    []
  );

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/login" || path === "/magic-login" || path === "/prompt-assistant") {
      setLoading(false);
      return;
    }

    refreshUser({ silent: false });
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
