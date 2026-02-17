import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import { useTranslation } from "react-i18next";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sendMagicLink = async () => {
    if (!email) return alert(t("emailRequired"));

    const res = await apiFetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (data.devLink) window.location.href = data.devLink;
    else alert(t("magicLinkSent"));
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
        else alert(t("googleLoginFailed"));
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "outline", size: "large", width: 320 }
    );
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT PANEL - on mobile this stacks above the form */}
      <div className="w-full md:w-1/2 relative flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-indigo-500 to-black opacity-90" />
        <div className="relative z-10 text-white p-8 md:p-16 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI CodeVerse OS</h1>
          <p className="text-base md:text-xl mb-4 leading-snug">Create. Build. Launch.<br/>
            The AI platform trusted by creators, founders, learners & innovators.</p>
          <p className="opacity-80 mb-6">
            Join 100,000+ minds already building the future.<br/>
            Start free. Upgrade anytime.
          </p>
          {/* Hero has no Continue button on mobile - action belongs inside the form */}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white text-black">
        <div className="w-full max-w-md p-10">

          <h2 className="text-2xl font-semibold mb-2">{t("welcomeBack")}</h2>
          <p className="text-sm opacity-60 mb-6">{t("signInContinue")}</p>

          <div id="googleBtn" className="mb-4 flex justify-center" />

          <div className="text-center text-sm opacity-50 mb-4">{t("or")}</div>

          <input
            id="email-input"
            type="email"
            placeholder={t("enterYourEmail")}
            className="w-full border p-3 rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={sendMagicLink}
            className="w-full bg-black text-white p-3 rounded mb-3"
          >
            {t("sendMagicLink")}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-2 bg-yellow-500 text-black p-3 rounded"
          >
            {t('continue') || 'Continue'}
          </button>

          <p className="text-xs opacity-50 text-center mt-6">{t("secureLoginLine")}</p>

        </div>
      </div>
    </div>
  );
}
