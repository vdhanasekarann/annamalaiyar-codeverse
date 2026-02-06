import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";

export default function MagicLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const token = params.get("token");
      if (!token) return;

      await apiFetch(`/auth/magic-verify?token=${token}`);
      navigate("/dashboard");
    };

    verify();
  }, []);

  return <div>Logging in...</div>;
}
