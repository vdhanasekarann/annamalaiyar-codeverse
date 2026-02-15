import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";

export default function AuthGate({ children }) {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(res => {
        if (!res.ok) throw new Error("not logged in");
        return res.json();
      })
      .then(() => setChecked(true))
      .catch(() => {
        setChecked(true);
        if (location.pathname !== "/login") {
          navigate("/login");
        }
      });
  }, []);

  if (!checked) return <LoaderScreen />;

  return children;
}