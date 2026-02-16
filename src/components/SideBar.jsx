// src/components/SideBar.jsx
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const linkClass = (isActive) => `px-3 py-2 rounded-xl transition ${isActive ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow" : "hover:bg-white/10"}`;


export default function SideBar({ mobile, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const go = path => {
    navigate(path);
    if (mobile && onNavigate) onNavigate();
  };

  const items = [
    { path: "/dashboard", label: t("home") || "Home", icon: "🏠" },
    { path: "/gpts", label: t("gptApps") || "GPT Apps", icon: "🤖" },
    { path: "/terms", label: t("terms") || "Terms", icon: "📄" },
    { path: "/premium", label: t("premium") || "Premium", icon: "💎" },
  ];

  {user?.role === "admin" && (
  <>
          <div className="border-t border-white/10 my-2" />

          <button
            onClick={() => go("/admin/revenue")}
            className={linkClass(location.pathname === "/admin/revenue")}
          >
            📊 Revenue
          </button>

          <button
            onClick={() => go("/admin/users")}
            className={linkClass(location.pathname === "/admin/users")}
          >
            👥 Users
          </button>
        </>
      )}
    
  return (
    <aside className="
      w-[240px]
      h-screen
      relative
      overflow-hidden
      text-white flex flex-col
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-600/10 before:via-purple-600/5 before:to-transparent before:pointer-events-none
      backdrop-blur-2xl bg-white/3 border-r border-white/6
      shadow-[0_8px_48px_rgba(99,102,241,0.15)]
    ">

      {/* BRAND */}
      <div className="p-4 border-b border-white/10 font-semibold text-lg flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-white">CV</div>
        <div>{t("brand") || "CodeVerse AI OS"}</div>
      </div>

      {/* USER */}
      {user && (
          <div className="p-4 border-b border-white/10 flex gap-3 items-center">
          <img
            src={`https://ui-avatars.com/api/?name=${user.email}`}
            className="w-10 h-10 rounded-xl"
          />
            <div className="text-sm">
              <div className="truncate">{user.email}</div>
              <div className="text-xs opacity-60">{t(user.role) || user.role}</div>
            </div>
        </div>
      )}

      {/* NAV */}
      <nav className="flex-1 p-3 space-y-3">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => go(item.path)}
            className={`group w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center gap-3 text-sm font-medium
              ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg scale-102"
                  : "hover:bg-white/6"
              }
            `}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={async () => {
          await apiFetch("/api/auth/logout", { method: "POST" });
          navigate("/login");
        }}
        className="m-3 py-2 rounded-2xl bg-red-500/20 hover:bg-red-500/30"
      >
        {t("logout") || "Logout"}
      </button>
    </aside>
  );
}

      
