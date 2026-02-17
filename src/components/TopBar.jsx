import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import { apiFetch } from "../lib/apiFetch";
import i18n from "../i18n";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";

export default function TopBar({ onOpenMobileMenu }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { query, setQuery } = useSearch();
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    navigate("/login");
  };
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (mobileSearchOpen && inputRef.current) {
      try {
        inputRef.current.focus();
      } catch (e) {}
    }
  }, [mobileSearchOpen]);

  // basic focus-trap & ESC handling for mobile search overlay
  useEffect(() => {
    function onKey(e) {
      if (!mobileSearchOpen) return;
      if (e.key === "Escape") setMobileSearchOpen(false);
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileSearchOpen]);

  // Desktop search input ref for focus button
  const desktopInputRef = React.useRef(null);

  return (
    <header className="glass-dark flex items-center justify-between px-4 h-14 border-b border-white/10 z-50">

      {/* LEFT */}
      <div className="flex items-center gap-2">
        <button
          className="md:hidden p-2 rounded hover:bg-white/10"
          onClick={onOpenMobileMenu}
          aria-label={t('openMenu')||'Open menu'}
        >
          ☰
        </button>

        <Link to="/" className="font-semibold text-base">
          {t('brand') || 'CodeVerse AI OS'}
        </Link>
      </div>

      {/* SEARCH */}
      <div className="flex flex-1 justify-center px-2">
        {/* Desktop search input */}
        <div className="hidden md:flex w-full max-w-md items-center gap-2">
          <input
            ref={desktopInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(`/gpts?q=${query}`);
            }}
            placeholder={t("searchPlaceholder") || "Search GPTs..."}
            className="w-full bg-zinc-800 border border-white/10 rounded-full px-4 py-1 text-sm"
          />
          <button
            onClick={() => desktopInputRef.current && desktopInputRef.current.focus()}
            className="p-2 rounded-full bg-zinc-800"
            aria-label="Focus Search"
          >
            🔍
          </button>
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
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileSearchOpen(false)}
        >
          <div ref={dialogRef} className="w-full max-w-md pointer-events-auto" onClick={(e)=>e.stopPropagation()}>
            <div className="bg-zinc-900/95 p-4 rounded-xl shadow-lg pointer-events-auto">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
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
                <button onClick={() => setMobileSearchOpen(false)} className="px-3 py-2">{t('close')||'Close'}</button>
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
            onChange={(e)=>{
              i18n.changeLanguage(e.target.value);
              // force remount via provider key handled in main.jsx
            }}
            aria-label={t('selectLanguage')||'Language'}
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

          {/* Logout icon (also keep text for desktop) */}
            <button onClick={logout} title={t('logout') || 'Logout'} className="flex items-center" aria-label={t('logout')||'Logout'}>
              <LogOut size={18} className="text-red-400" />
            </button>
        </div>
      )}
    </header>
  );
}
