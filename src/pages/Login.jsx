import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import { useTranslation } from "react-i18next";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const focusEmailInput = () => {
    const input = document.getElementById("email-input");
    if (input) input.focus();
  };

  const sendMagicLink = async () => {
    if (!email) {
      alert(t("emailRequired") || "Email required");
      focusEmailInput();
      return;
    }

    try {
      setSending(true);
      const res = await apiFetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || t("errorTryAgain") || "Something went wrong");
        return;
      }

      if (data.devLink) window.location.href = data.devLink;
      else alert(t("magicLinkSent") || "Magic link sent to your email");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (res) => {
        const r = await apiFetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential: res.credential }),
        });

        if (r.ok) navigate("/dashboard");
        else alert(t("googleLoginFailed") || "Google login failed");
      },
    });

    window.google.accounts.id.renderButton(document.getElementById("googleBtn"), {
      theme: "outline",
      size: "large",
      width: 320,
    });
  }, [navigate, t]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 relative flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-indigo-500 to-black opacity-90" />
        <div className="relative z-10 text-white p-8 md:p-16 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI CodeVerse OS</h1>
          <p className="text-base md:text-xl mb-4 leading-snug">
            Create. Build. Launch.
            <br />
            The AI platform trusted by creators, founders, learners and innovators.
          </p>
          <p className="opacity-80 mb-6">
            Join 100,000+ minds already building the future.
            <br />
            Start free. Upgrade anytime.
          </p>
          <div className="hidden md:block">
            <button
              onClick={focusEmailInput}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:opacity-95"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center bg-white text-black">
        <div className="w-full max-w-md p-10">
          <h2 className="text-2xl font-semibold mb-2">{t("welcomeBack") || "Welcome Back"}</h2>
          <p className="text-sm opacity-60 mb-6">
            {t("signInContinue") || "Sign in to continue your AI journey"}
          </p>

          <div id="googleBtn" className="mb-4 flex justify-center" />
          <div className="text-center text-sm opacity-50 mb-4">{t("or") || "OR"}</div>

          <input
            id="email-input"
            type="email"
            placeholder={t("enterYourEmail") || "Enter your email"}
            className="w-full border p-3 rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMagicLink();
            }}
          />

          <button
            onClick={sendMagicLink}
            disabled={sending}
            className="w-full bg-black text-white p-3 rounded mb-3 disabled:opacity-60"
          >
            {sending ? (t("sending") || "Sending...") : (t("sendMagicLink") || "Send Magic Link")}
          </button>

          <button
            onClick={sendMagicLink}
            disabled={sending}
            className="w-full mt-2 bg-yellow-500 text-black p-3 rounded font-semibold disabled:opacity-60"
          >
            {sending ? (t("sending") || "Sending...") : (t("continue") || "Continue")}
          </button>

          <p className="text-xs opacity-50 text-center mt-6">
            {t("secureLoginLine") || "Secure login • No password required"}
          </p>
        </div>
      </div>
    </div>
  );
}
