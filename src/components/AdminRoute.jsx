import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config/api";

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(user => {
        if (user.role === "admin") setStatus("ok");
        else setStatus("forbidden");
      })
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "loading") return null;
  if (status === "unauthenticated") return <Navigate to="/login" />;
  if (status === "forbidden") return <Navigate to="/dashboard" />;

  return children;
}