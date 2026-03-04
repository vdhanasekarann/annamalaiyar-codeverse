import React from "react";
import ReactDOM from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import App from "./App";
import "./index.css";
import "./styles/glass.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/motion.css";
import { setAuthToken } from "./lib/authToken";

if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add("native-app");
  document.body.classList.add("native-app");
}

if ("serviceWorker" in navigator && import.meta.env.PROD && !Capacitor.isNativePlatform()) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              installingWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((err) => {
        console.warn("Service worker registration failed:", err);
      });

    let isRefreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (isRefreshing) return;
      isRefreshing = true;
      window.location.reload();
    });
  });
}

if (Capacitor.isNativePlatform() && !window.__cvDeepLinkListenerRegistered) {
  window.__cvDeepLinkListenerRegistered = true;
  CapacitorApp.addListener("appUrlOpen", async ({ url }) => {
    if (!url) return;

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return;
    }

    const isCustomDeepLink =
      parsed.protocol === "com.aicodeverse.app:" &&
      parsed.hostname === "auth" &&
      parsed.pathname.startsWith("/callback");

    const isHttpsAppLink =
      parsed.protocol === "https:" &&
      parsed.hostname === "app.aicodeverse.com" &&
      parsed.pathname.startsWith("/auth/callback");

    if (!isCustomDeepLink && !isHttpsAppLink) {
      return;
    }

    const token = parsed.searchParams.get("token");
    if (token) {
      setAuthToken(token);
    }

    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.close();
    } catch {
      // Browser may already be closed.
    }

    window.location.replace(token ? "/dashboard" : "/login");
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
      <SidebarProvider>
        <SearchProvider>
          <ErrorBoundary>
            <I18nextProvider i18n={i18n} key={i18n.language}>
              <App />
            </I18nextProvider>
          </ErrorBoundary>
        </SearchProvider>
      </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
