import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { apiFetch } from "../lib/apiFetch";
import { API_BASE } from "../config/api";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { setAuthToken } from "../lib/authToken";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sendingMagic, setSendingMagic] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [googleUnavailable, setGoogleUnavailable] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, setUser, refreshUser } = useAuth();

  const loggedOutFlow = useMemo(
    () => new URLSearchParams(window.location.search).get("logged_out") === "1",
    []
  );
  const isMobileBrowserMode = useMemo(
    () => new URLSearchParams(window.location.search).get("mobile_app") === "1",
    []
  );

  const isNativeApp = useMemo(() => {
    const cap = window?.Capacitor;
    return Boolean(
      cap?.isNativePlatform?.() ||
      cap?.getPlatform?.() === "android" ||
      cap?.getPlatform?.() === "ios" ||
      Capacitor?.isNativePlatform?.()
    );
  }, []);

  const hydrateSessionAndRedirect = useCallback(async () => {
    const me = await refreshUser({
      retries: 6,
      retryDelayMs: 250,
    });
    if (!me) return false;
    navigate("/dashboard", { replace: true });
    return true;
  }, [navigate, refreshUser]);

  const focusEmailInput = () => {
    const input = document.getElementById("email-input");
    if (input) input.focus();
  };

  const readApiError = useCallback(async (res, fallback) => {
    const data = await res.clone().json().catch(() => null);
    if (data?.error) return data.error;
    const rawText = await res.text().catch(() => "");
    const text = (rawText || "").trim();
    if (text && text.length <= 160) return `${fallback} (${res.status}): ${text}`;
    return `${fallback} (${res.status})`;
  }, []);

  const persistSessionFromResponse = useCallback((payload) => {
    if (payload?.token) {
      setAuthToken(payload.token);
    }
  }, []);

  const applyLoginPayload = useCallback(
    async (payload, fallbackEmail = "") => {
      persistSessionFromResponse(payload);

      // When login is happening in external browser for native app,
      // return back to the app via deep link with token.
      if (isMobileBrowserMode && !isNativeApp) {
        const token = typeof payload?.token === "string" ? payload.token : "";
        if (token) {
          const params = new URLSearchParams({ token });
          const deepLinkEmail = payload?.user?.email || fallbackEmail;
          if (deepLinkEmail) {
            params.set("email", deepLinkEmail);
          }
          window.location.replace(`com.aicodeverse.app://auth/callback?${params.toString()}`);
          return true;
        }
      }

      if (payload?.user?.email) {
        setUser(payload.user);
        navigate("/dashboard", { replace: true });
        return true;
      }

      if (payload?.token) {
        try {
          const body = JSON.parse(atob(payload.token.split(".")[1] || ""));
          const decodedUser = {
            email: body?.email || fallbackEmail,
            role: body?.role || "user",
            plan: body?.plan || "free",
            tv: Number(body?.tv ?? 0),
          };
          if (decodedUser.email) {
            setUser(decodedUser);
            navigate("/dashboard", { replace: true });
            return true;
          }
        } catch {
          // Fallback below
        }
      }

      return hydrateSessionAndRedirect();
    },
    [
      hydrateSessionAndRedirect,
      isMobileBrowserMode,
      isNativeApp,
      navigate,
      persistSessionFromResponse,
      setUser,
    ]
  );

  const openGoogleBrowserLogin = useCallback(async () => {
    const appOrigin = (import.meta.env.VITE_APP_URL || "https://app.aicodeverse.com").replace(
      /\/+$/,
      ""
    );
    const loginUrl = `${appOrigin}/login?mobile_app=1&provider=google`;

    if (!isNativeApp) {
      window.location.assign(loginUrl);
      return;
    }

    try {
      const { Browser } = await import("@capacitor/browser");
      const finishListener = await Browser.addListener("browserFinished", async () => {
        await hydrateSessionAndRedirect();
        setSigningIn(false);
        finishListener.remove();
      });

      setSigningIn(true);
      await Browser.open({
        url: loginUrl,
        presentationStyle: "popover",
      });

      // Safety unlock in case callback is not fired.
      window.setTimeout(() => {
        setSigningIn(false);
      }, 45000);
    } catch {
      setSigningIn(false);
      window.location.assign(loginUrl);
    }
  }, [hydrateSessionAndRedirect, isNativeApp]);

  const handleMobileGoogleLogin = useCallback(async () => {
    if (signingIn) return;
    await openGoogleBrowserLogin();
  }, [openGoogleBrowserLogin, signingIn]);

  const sendMagicLink = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      alert(t("emailRequired") || "Email required");
      focusEmailInput();
      return;
    }

    try {
      setSendingMagic(true);
      const res = await apiFetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fallback = t("errorTryAgain") || "Something went wrong";
        const message = data.error || (await readApiError(res, fallback));
        alert(message);
        return;
      }

      if (data.devLink) {
        window.location.href = data.devLink;
      } else {
        alert(t("magicLinkSent") || "Magic link sent to your email");
      }
    } catch {
      alert("Unable to reach server. Check internet/API and try again.");
    } finally {
      setSendingMagic(false);
    }
  };

  const continueWithEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      alert(t("emailRequired") || "Email required");
      focusEmailInput();
      return;
    }

    try {
      setSigningIn(true);
      const loginRes = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const payload = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) {
        const fallback = t("errorTryAgain") || "Unable to login";
        const message = payload.error || (await readApiError(loginRes, fallback));
        alert(message);
        return;
      }

      if (await applyLoginPayload(payload, normalizedEmail)) return;
      alert(t("errorTryAgain") || "Login session was not created. Please try again.");
    } catch {
      alert("Unable to reach server. Check internet/API and try again.");
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    navigate("/dashboard", { replace: true });
  }, [navigate, user]);

  useEffect(() => {
    let disposed = false;
    const target = document.getElementById("googleBtn");
    if (!target) return;
    target.innerHTML = "";
    setGoogleUnavailable(false);

    if (isNativeApp) {
      return;
    }

    const setupGoogleButton = () => {
      if (disposed) return true;
      if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) return false;

      try {
        if (loggedOutFlow) {
          window.google.accounts.id.disableAutoSelect();
          window.google.accounts.id.cancel();
        }

        const initOptions = {
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          auto_select: isMobileBrowserMode ? false : !loggedOutFlow,
        };

        if (isMobileBrowserMode) {
          initOptions.ux_mode = "redirect";
          initOptions.login_uri = `${API_BASE}/api/auth/google-redirect?mobile_app=1`;
        } else {
          initOptions.callback = async (res) => {
            try {
              const r = await apiFetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ credential: res.credential }),
              });

              const payload = await r.json().catch(() => ({}));
              if (!r.ok) {
                const msg =
                  payload.error ||
                  (await readApiError(r, t("googleLoginFailed") || "Google login failed"));
                alert(msg);
                return;
              }

              if (await applyLoginPayload(payload)) return;
              alert(t("errorTryAgain") || "Login session was not created. Please try again.");
            } catch {
              alert(t("googleLoginFailed") || "Google login failed");
            } finally {
              setSigningIn(false);
            }
          };
        }

        window.google.accounts.id.initialize(initOptions);

        window.google.accounts.id.renderButton(target, {
          theme: "outline",
          size: "large",
          width: 320,
        });

        window.setTimeout(() => {
          if (disposed) return;
          if (target.childElementCount === 0) {
            setGoogleUnavailable(true);
          }
        }, 700);

        return true;
      } catch {
        setGoogleUnavailable(true);
        return true;
      }
    };

    if (setupGoogleButton()) {
      return () => {
        disposed = true;
      };
    }

    const poll = window.setInterval(() => {
      if (setupGoogleButton()) {
        window.clearInterval(poll);
      }
    }, 250);

    const timeout = window.setTimeout(() => {
      window.clearInterval(poll);
      if (!disposed) {
        setGoogleUnavailable(true);
      }
    }, 5000);

    return () => {
      disposed = true;
      window.clearInterval(poll);
      window.clearTimeout(timeout);
    };
  }, [API_BASE, applyLoginPayload, isMobileBrowserMode, isNativeApp, loggedOutFlow, readApiError, t]);

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

          <div
            id="googleBtn"
            className={`${isNativeApp ? "absolute -left-[9999px] top-0" : "mb-4 flex justify-center min-h-[44px]"}`}
          />

          {isNativeApp ? (
            <button
              onClick={handleMobileGoogleLogin}
              disabled={signingIn}
              className="w-full border border-zinc-300 rounded p-3 mb-4 font-semibold disabled:opacity-60"
            >
              {signingIn ? "Signing in..." : "Continue in Browser"}
            </button>
          ) : (
            googleUnavailable && (
              <button
                onClick={openGoogleBrowserLogin}
                className="w-full border border-zinc-300 rounded p-3 mb-4 font-semibold"
              >
                Continue with Google
              </button>
            )
          )}

          <div className="text-center text-sm opacity-50 mb-4">{t("or") || "OR"}</div>

          <input
            id="email-input"
            type="email"
            placeholder={t("enterYourEmail") || "Enter your email"}
            className="w-full border p-3 rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") continueWithEmail();
            }}
          />

          <button
            onClick={sendMagicLink}
            disabled={sendingMagic || signingIn}
            className="w-full bg-black text-white p-3 rounded mb-3 disabled:opacity-60"
          >
            {sendingMagic
              ? t("sending") || "Sending..."
              : t("sendMagicLink") || "Send Magic Link"}
          </button>

          <button
            onClick={continueWithEmail}
            disabled={signingIn || !email.trim()}
            className="w-full mt-2 bg-yellow-500 text-black p-3 rounded font-semibold disabled:opacity-60"
          >
            {signingIn ? t("sending") || "Signing in..." : t("continue") || "Continue"}
          </button>

          <p className="text-xs opacity-50 text-center mt-6">
            {t("secureLoginLine") || "Secure login - No password required"}
          </p>
        </div>
      </div>
    </div>
  );
}
