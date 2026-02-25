import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, Search, X } from "lucide-react";
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
  const { headerHeight, shouldUseSafeArea } = useSafeArea();
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const logout = async () => {
    let logoutOk = false;
    try {
      const res = await apiFetch("/api/auth/logout", { method: "POST" });
      logoutOk = res.ok;
    } catch {
      logoutOk = false;
    }

    // Prevent Google One Tap auto sign-in right after logging out.
    try {
      window.google?.accounts?.id?.disableAutoSelect?.();
      window.google?.accounts?.id?.cancel?.();
    } catch {
      // no-op
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
      className={`fixed top-0 left-0 right-0 backdrop-blur-xl bg-black/70 border-b border-white/10 flex items-center px-3 md:px-4 z-50 ${
        shouldUseSafeArea ? 'safe-top-padding' : 'h-16'
      }`}
      style={{
        paddingTop: shouldUseSafeArea ? 0 : undefined,
        height: shouldUseSafeArea ? `${headerHeight}px` : undefined
      }}
    >
      <div className="flex gap-2 mr-3">
        <span className="w-3 h-3 bg-red-500 rounded-full" />
        <span className="w-3 h-3 bg-yellow-400 rounded-full" />
        <span className="w-3 h-3 bg-green-500 rounded-full" />
      </div>

      <button onClick={onOpenMobileMenu} className="md:hidden mr-2 text-white" aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>

      <Link
        to="/"
        className="flex items-center gap-2 shrink-0 min-w-0"
      >
        <img
          src="/AICodeverse.png"
          alt="CodeVerse AI OS"
          className="w-7 h-7 rounded-md object-contain"
        />
        <span className="hidden md:inline font-semibold tracking-wide text-sm md:text-base whitespace-nowrap">
          CodeVerse AI OS
        </span>
      </Link>

      <div className="flex-1 flex justify-center px-2 md:px-4">
        <div className="hidden md:flex w-full max-w-md items-center bg-zinc-900 border border-white/10 rounded-full px-3 py-1">
          <Search className="w-4 h-4 text-zinc-400 mr-2" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/gpts?q=${query}`)}
            placeholder={t("searchPlaceholder") || "Search GPTs..."}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <button
          className="md:hidden text-zinc-300 p-1.5 rounded-md border border-white/10 bg-zinc-900/70"
          aria-label="Search GPTs"
          onClick={() => {
            setMobileSearchOpen(true);
            setTimeout(() => mobileInputRef.current?.focus(), 0);
          }}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {user && (
        <div className="flex items-center gap-2 text-xs md:text-sm shrink-0">
          <span className="hidden sm:inline px-2 py-1 rounded bg-zinc-800 text-xs">{user.plan}</span>

          <select
            value={i18n.language}
            onChange={(e) => {
              const lang = e.target.value;
              localStorage.setItem("cv_lang", lang);
              i18n.changeLanguage(lang);
            }}
            className="bg-zinc-800 px-2 py-1 rounded text-xs max-w-[88px]"
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

      {mobileSearchOpen && (
        <div 
          className="absolute left-0 right-0 md:hidden px-3 py-2 bg-black/90 border-b border-white/10"
          style={{ top: `${headerHeight}px` }}
        >
          <div className="flex items-center gap-2 bg-zinc-900 border border-white/15 rounded-lg px-2 py-2">
            <Search className="w-4 h-4 text-zinc-400" />
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
              className="w-full bg-transparent text-sm outline-none"
            />
            <button
              className="text-zinc-300"
              onClick={() => {
                navigate(`/gpts${query ? `?q=${encodeURIComponent(query)}` : ""}`);
                setMobileSearchOpen(false);
              }}
              aria-label="Go search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              className="text-zinc-300"
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
