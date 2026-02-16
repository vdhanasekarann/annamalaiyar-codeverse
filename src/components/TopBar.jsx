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
  const [aiOpen, setAiOpen] = React.useState(false);

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
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          onKeyDown={(e)=>{
            if(e.key==="Enter") navigate(`/gpts?q=${query}`)
          }}
          placeholder={t("searchPlaceholder") || "Search GPTs..."}
          className="w-full max-w-md bg-zinc-800 border border-white/10 rounded-full px-4 py-1 text-sm"
        />
      </div>

      {/* AI TOOLS */}
      <div className="relative">
        <button
          onClick={() => setAiOpen((s) => !s)}
          className="hidden md:inline-block px-3 py-1 rounded bg-zinc-800 text-xs mr-3"
        >
          AI Tools ▾
        </button>
        {aiOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-black/70 backdrop-blur rounded-xl border border-white/10">
            {[
              ["ChatGPT","https://chat.openai.com"],
              ["Claude","https://claude.ai"],
              ["Gemini","https://gemini.google.com"],
              ["Copilot","https://copilot.microsoft.com"],
              ["CooklyHub","https://cooklyhub.com"],
              ["CA-sentinel","https://ca.kannizconites.com"]
            ].map(([name, url]) => (
              <a key={name} href={url} target="_blank" className="block px-4 py-2 hover:bg-indigo-600">
                {name}
              </a>
            ))}
          </div>
        )}
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
