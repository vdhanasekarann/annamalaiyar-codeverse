import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import { apiFetch } from "../lib/apiFetch";
import i18n from "../i18n";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";

export default function TopBar({ onOpenMobileMenu }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { query, setQuery } = useSearch();

  const logout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  return (
    <header className="glass flex items-center justify-between px-4 h-14 border-b border-white/10">

      {/* LEFT */}
      <div className="flex items-center gap-2">
        <button
          className="md:hidden p-2 rounded hover:bg-white/10"
          onClick={onOpenMobileMenu}
        >
          ☰
        </button>

        <Link to="/" className="font-semibold text-base">
          CodeVerse AI OS
        </Link>
      </div>

      {/* SEARCH */}
      <div className="flex flex-1 justify-center px-2">
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          onKeyDown={(e)=>{
            if(e.key==="Enter") navigate(`/gpts?q=${query}`)
          }}
          placeholder="Search GPTs..."
          className="w-full max-w-md bg-zinc-800 border border-white/10 rounded-full px-4 py-1 text-sm"
        />
      </div>

      {/* RIGHT */}
      {user && (
        <div className="flex items-center gap-3 text-sm">

          <span className="px-2 py-1 rounded bg-zinc-800 text-xs">
            {user.plan?.toUpperCase()}
          </span>

          <Link
            to="/prompt-assistant"
            className="hidden md:block px-3 py-1 rounded bg-indigo-600 text-xs"
          >
            🤖 Ask AI
          </Link>

          <span className="hidden md:block opacity-80">
            {user.role === "admin" ? "Admin" : "User"}
          </span>

          <select
            value={i18n.language}
            onChange={(e)=>i18n.changeLanguage(e.target.value)}
          >
            <option value="en">EN</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिंदी</option>
            <option value="ml">മലയാളം</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="te">తెలుగు</option>
          </select>

          {user.plan === "free" && (
            <Link
              to="/premium"
              className="px-3 py-1 rounded bg-indigo-600 text-xs"
            >
              Upgrade
            </Link>
          )}

          <button
            onClick={logout}
            className="text-red-400 text-xs"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
