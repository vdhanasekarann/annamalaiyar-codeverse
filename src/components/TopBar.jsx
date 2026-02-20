import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { apiFetch } from "../lib/apiFetch";
import { useTheme } from "../context/ThemeContext";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ta", label: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD" },
  { value: "hi", label: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { value: "ml", label: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02" },
  { value: "kn", label: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1" },
  { value: "te", label: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41" },
];

export default function TopBar({ onOpenMobileMenu }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { query, setQuery } = useSearch();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const inputRef = useRef(null);

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 backdrop-blur-xl bg-black/70 border-b border-white/10 flex items-center px-3 md:px-4 z-50">
      <div className="flex gap-2 mr-3">
        <span className="w-3 h-3 bg-red-500 rounded-full" />
        <span className="w-3 h-3 bg-yellow-400 rounded-full" />
        <span className="w-3 h-3 bg-green-500 rounded-full" />
      </div>

      <button
        onClick={onOpenMobileMenu}
        className="md:hidden mr-2 text-white"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link
        to="/"
        className="font-semibold tracking-wide text-sm md:text-base truncate max-w-[140px] md:max-w-none"
      >
        CodeVerse AI OS
      </Link>

      <div className="flex-1 flex justify-center px-2 md:px-4">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/gpts?q=${query}`)}
          placeholder={t("searchPlaceholder") || "Search GPTs..."}
          className="hidden md:block w-full max-w-md bg-zinc-900 border border-white/10 rounded-full px-4 py-1 text-sm"
        />
      </div>

      {user && (
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="hidden sm:inline px-2 py-1 rounded bg-zinc-800 text-xs">{user.plan}</span>

          <select
            value={i18n.language}
            onChange={(e) => {
              const lang = e.target.value;
              localStorage.setItem("cv_lang", lang);
              i18n.changeLanguage(lang);
            }}
            className="bg-zinc-800 px-2 py-1 rounded text-xs"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-zinc-800 px-2 py-1 rounded text-xs"
          >
            <option value="gold">Gold</option>
            <option value="pink">Pink</option>
            <option value="blue">Blue</option>
          </select>

          <button onClick={logout} aria-label="Logout">
            <LogOut className="text-red-400 w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      )}
    </header>
  );
}
