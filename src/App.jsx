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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/magic-login" element={<MagicLogin />} />

        {/* APP */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gpts" element={<GPTs />} />
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
          <Route path="/admin/revenue" element={<AdminRevenue />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
