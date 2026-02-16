import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import { apiFetch } from "../lib/apiFetch";
import i18n from "../i18n";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { useTranslation } from "react-i18next";

export default function TopBar({ onOpenMobileMenu }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { query, setQuery } = useSearch();
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    navigate("/login");
  };
  const { t } = useTranslation();

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
        {/* Desktop search input */}
        <div className="hidden md:block w-full max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(`/gpts?q=${query}`);
            }}
            placeholder={t("searchPlaceholder") || "Search GPTs..."}
            className="w-full bg-zinc-800 border border-white/10 rounded-full px-4 py-1 text-sm"
          />
        </div>

        {/* Mobile search icon (opens small overlay input) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="p-2 rounded-full bg-zinc-800"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      </div>

      {/* AI Tools removed from TopBar (moved/removed per UI changes) */}
      <div />

      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-md">
            <div className="bg-zinc-900/90 p-4 rounded-xl backdrop-blur border border-white/10">
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setMobileSearchOpen(false);
                      navigate(`/gpts?q=${query}`);
                    }
                  }}
                  placeholder={t("searchPlaceholder") || "Search GPTs..."}
                  className="w-full bg-transparent border border-white/10 rounded px-3 py-2"
                />
                <button onClick={() => setMobileSearchOpen(false)} className="px-3 py-2">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
