// src/components/SideBar.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import DoubleSidebar from "./ui/DoubleSidebar";

export default function SideBar({ mobile, onNavigate }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const items = [
    { path: "/dashboard", label: t("home") || "Home", icon: "🏠" },
    { path: "/gpts", label: t("gptApps") || "GPT Apps", icon: "🤖" },
    { path: "/terms", label: t("terms") || "Terms", icon: "📄" },
    { path: "/premium", label: t("premium") || "Premium", icon: "💎" },
  ];
  if (user?.role === "admin") {
    items.push({ path: "/admin/revenue", label: t("revenue") || "Revenue", icon: "📊" });
    items.push({ path: "/admin/users", label: t("users") || "Users", icon: "👥" });
  }

  return <DoubleSidebar items={items} mobile={mobile} onNavigate={onNavigate} />;
}

      
