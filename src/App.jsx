import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Premium from "./pages/Premium";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminUsers from "./pages/admin/Users";
import AdminRoute from "./components/AdminRoute";
import MagicLogin from "./pages/MagicLogin";
import AuthGate from "./components/AuthGate";
import PromptAssistant from "./pages/PromptAssistant";
import React, { Suspense } from "react";
import { useTranslation } from 'react-i18next';
import GPTDetails from "./pages/GPTDetails";
const ReviewsPage = React.lazy(() => import("./pages/Reviews"));
import Terms from "./pages/Terms";

const GPTsPage = React.lazy(() => import("./pages/GPTs"));

export default function App() {
  const { t } = useTranslation();
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
              <Suspense fallback={<div>{t('loading') || 'Loading...'}</div>}>
                <GPTsPage />
              </Suspense>
            }
          />
          <Route path="/gpt/:id" element={<GPTDetails />} />
          <Route path="/reviews/:id" element={
            <React.Suspense fallback={<div>{t('loading') || 'Loading...'}</div>}>
              <ReviewsPage />
            </React.Suspense>
          } />
         <Route path="/premium" element={<Premium />} />
          <Route path="/terms" element={<Terms />} />

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
