import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Navigate, Link } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
  <App />
</ErrorBoundary>
  </React.StrictMode>
);