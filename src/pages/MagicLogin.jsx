import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import { setAuthToken } from "../lib/authToken";

export default function MagicLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const verify = async () => {
      const token = params.get("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await apiFetch(
          `/api/auth/magic-verify?token=${encodeURIComponent(token)}&format=json`,
          { method: "GET", credentials: "include" }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || "Magic login failed");
        }

        if (data?.token) {
          setAuthToken(data.token);
        }

        if (!active) return;
        navigate("/dashboard", { replace: true });
      } catch {
        if (!active) return;
        navigate("/login", { replace: true });
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [navigate, params]);

  return <div>Logging in...</div>;
}
