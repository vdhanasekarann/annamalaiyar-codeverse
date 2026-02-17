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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SidebarProvider>
        <SearchProvider>
          <ErrorBoundary>
            <I18nextProvider i18n={i18n}>
              <App />
            </I18nextProvider>
          </ErrorBoundary>
        </SearchProvider>
      </SidebarProvider>
    </AuthProvider>
  </React.StrictMode>
);
