import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { setAuthToken } from "../lib/authToken";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setAuthToken(token);

    if (Capacitor.isNativePlatform()) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const query = new URLSearchParams(params);
    const schemeUrl = `com.aicodeverse.app://auth/callback?${query.toString()}`;
    const intentUrl = `intent://auth/callback?${query.toString()}#Intent;scheme=com.aicodeverse.app;package=com.aicodeverse.app;end`;
    const isAndroid = /android/i.test(navigator.userAgent || "");

    window.location.replace(isAndroid ? intentUrl : schemeUrl);

    const fallback = window.setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1600);

    return () => window.clearTimeout(fallback);
  }, [navigate, params]);

  return <div className="p-6 text-center">Completing sign-in...</div>;
}
