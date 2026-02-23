import React from "react";
import ReactDOM from "react-dom/client";
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

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
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
