import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import LoaderScreen from "../components/LoaderScreen";

export default function AuthGate({ children }) {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

const [status, setStatus] = useState("checking");

useEffect(() => {
  apiFetch("/api/auth/me")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(() => setStatus("ok"))
    .catch(() => setStatus("fail"));
}, []);

if (status === "checking") return <LoaderScreen />;
if (status === "fail") return <Navigate to="/login" replace />;

return children;
}