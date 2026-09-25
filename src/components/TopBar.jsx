import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { apiFetch } from "../lib/apiFetch";
import { clearAuthToken } from "../lib/authToken";
import { useTheme } from "../context/ThemeContext";
import { useSafeArea } from "../hooks/useSafeArea";

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
  const { user, setUser } = useAuth();
  const { query, setQuery } = useSearch();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { headerHeight } = useSafeArea();

  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth || 390);

  const safeInsetTop = Math.max(0, headerHeight - 64);
  const compactMobile = useMemo(() => viewportWidth < 390, [viewportWidth]);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth || 390);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    const id = window.setTimeout(() => {
      mobileInputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(id);
  }, [mobileSearchOpen]);

  const logout = async () => {
    let logoutOk = false;
    try {
      const res = await apiFetch("/api/auth/logout", { method: "POST" });
      logoutOk = res.ok;
    } catch {
      logoutOk = false;
    }

    try {
      window.google?.accounts?.id?.disableAutoSelect?.();
      window.google?.accounts?.id?.cancel?.();
    } catch {
      // ignore
    }

    setUser(null);
    clearAuthToken();

    if (!logoutOk) {
      alert(t("logoutFailed") || "Logout failed. Please try again.");
      return;
    }

    navigate("/login?logged_out=1", { replace: true });
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 px-1.5 sm:px-4"
      style={{ height: `${headerHeight}px`, paddingTop: `${safeInsetTop}px` }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1.5 rounded-2xl border border-white/15 bg-black/55 px-2 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.45)]">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden rounded-xl border border-white/20 bg-white/5 p-2 text-white transition hover:bg-white/10"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="8.5" x2="15" y2="8.5" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="15.5" x2="15" y2="15.5" />
          </svg>
        </button>

        <Link
          to="/dashboard"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-1.5 py-1 text-white transition hover:bg-white/10"
        >
          <img
            src="/AICodeverse.png"
            alt="CodeVerse AI"
            className="h-10 w-10 rounded-lg border border-white/15 object-cover"
            onError={(e) => {
              e.currentTarget.src = "/logo.webp";
            }}
          />
          <span className="hidden truncate text-sm font-semibold md:block">CodeVerse AI</span>
        </Link>

        <div className="hidden max-w-xl flex-1 md:block">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/gpts${query ? `?q=${encodeURIComponent(query)}` : ""}`);
                }
              }}
              placeholder={t("searchPlaceholder") || "Search GPTs..."}
              className="w-full rounded-xl border border-white/15 bg-white/8 py-2 pl-10 pr-3 text-sm text-white placeholder-white/60 outline-none transition focus:border-white/35 focus:bg-white/12"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          </div>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1.5">
          {!compactMobile && (
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="rounded-xl border border-white/20 bg-white/5 p-2 text-white transition hover:bg-white/10 md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className={`rounded-lg border border-white/20 bg-white/8 px-2 py-1.5 text-xs text-white outline-none transition focus:border-white/35 md:w-[132px] md:text-sm ${
              compactMobile ? "w-[84px]" : "w-[96px]"
            }`}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900">
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className={`rounded-lg border border-white/20 bg-white/8 px-2 py-1.5 text-xs text-white outline-none transition focus:border-white/35 md:w-[104px] md:text-sm ${
              compactMobile ? "w-[70px]" : "w-[80px]"
            }`}
          >
            <option value="gold" className="bg-zinc-900">Gold</option>
            <option value="pink" className="bg-zinc-900">Pink</option>
            <option value="blue" className="bg-zinc-900">Blue</option>
          </select>

          {user && (
            <button
              onClick={logout}
              className="shrink-0 rounded-xl border border-white/20 bg-white/5 p-2 text-white transition hover:bg-white/10"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="mx-auto mt-2 max-w-7xl md:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/75 px-2.5 py-2 backdrop-blur-xl">
            <Search className="h-4 w-4 text-zinc-300" />
            <input
              ref={mobileInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/gpts${query ? `?q=${encodeURIComponent(query)}` : ""}`);
                  setMobileSearchOpen(false);
                }
              }}
              placeholder={t("searchPlaceholder") || "Search GPTs..."}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-400"
            />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="text-zinc-300 transition hover:text-white"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
