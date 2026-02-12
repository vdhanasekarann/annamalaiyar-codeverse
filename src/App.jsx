import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GPTs from "./pages/GPTs";
import Premium from "./pages/Premium";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminUsers from "./pages/admin/Users";
import AdminRoute from "./components/AdminRoute";
import MagicLogin from "./pages/MagicLogin";
import AuthGate from "./components/AuthGate";
import PromptAssistant from "./pages/PromptAssistant";
import React, { Suspense } from "react";

const GPTsPage = React.lazy(() => import("./pages/GPTs"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/magic-login" element={<MagicLogin />} />

        {/* PROTECTED APP ROUTES */}
        <Route
          element={
            <AuthGate>
              <Layout />
            </AuthGate>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/gpts"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <GPTsPage />
              </Suspense>
            }
          />
         <Route path="/premium" element={<Premium />} />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/revenue"
            element={
              <AdminRoute>
                <AdminRevenue />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="/prompt-assistant" element={<PromptAssistant />} />

      </Routes>
    </BrowserRouter>
  );
}