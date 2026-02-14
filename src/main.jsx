import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Navigate, Link } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
  <App />
  </I18nextProvider>
</ErrorBoundary>
  </React.StrictMode>
);