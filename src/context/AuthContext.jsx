import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../lib/apiFetch";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/login" || path === "/magic-login" || path === "/prompt-assistant") {
      setLoading(false);
      return;
    }

    async function loadUser() {
      try {
        const res = await apiFetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("unauth");

        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
