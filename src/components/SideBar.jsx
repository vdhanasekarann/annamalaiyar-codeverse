// src/components/SideBar.jsx
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";


export default function SideBar({ mobile, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const go = path => {
    navigate(path);
    if (mobile && onNavigate) onNavigate();
  };

  const items = [
    { path:"/dashboard", label:"Home", icon:"🏠" },
    { path:"/gpts", label:"GPT Apps", icon:"🤖" },
    { path:"/terms", label:"Terms", icon:"📄" },
    { path:"/premium", label:"Premium", icon:"💎" }
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
      w-[230px]
      h-screen
      backdrop-blur-xl
      bg-white/5
      border-r border-white/10
      text-white flex flex-col
      shadow-[0_0_40px_rgba(99,102,241,0.15)]
    ">

      {/* BRAND */}
      <div className="p-4 border-b border-white/10 font-semibold text-lg">
        CodeVerse AI OS
      </div>

      {/* USER */}
      {user && (
        <div className="p-4 border-b border-white/10 flex gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${user.email}`}
            className="w-10 h-10 rounded-xl"
          />
          <div className="text-sm">
            <div className="truncate">{user.email}</div>
            <div className="text-xs opacity-60">{user.role}</div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="flex-1 p-3 space-y-2">
        {items.map(item=>(
          <button
            key={item.path}
            onClick={()=>go(item.path)}
            className={`
              w-full text-left px-3 py-2 rounded-xl
              transition
              ${location.pathname===item.path
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow"
                : "hover:bg-white/10"}
            `}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={async()=>{
          await apiFetch("/api/auth/logout",{method:"POST"});
          navigate("/login");
        }}
        className="m-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30"
      >
        Logout
      </button>
    </aside>
  );
}

      
