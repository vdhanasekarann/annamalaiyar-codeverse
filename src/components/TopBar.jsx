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
        shouldUseSafeArea ? 'safe-top-padding' : 'h-14'
      }`}
      style={{
        paddingTop: shouldUseSafeArea ? 0 : undefined,
        height: shouldUseSafeArea ? `${headerHeight}px` : undefined
      }}
    >
      {/* Left Section - Menu & Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button onClick={onOpenMobileMenu} className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">
            AI
          </div>
          <span className="hidden sm:block font-semibold text-sm">CodeVerse</span>
        </Link>
      </div>

      {/* Center Section - Search (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-4">
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder") || "Search AI tools..."}
            className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Mobile Search */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Mobile Language & Theme */}
        <div className="md:hidden flex items-center gap-1">
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-white/40 transition-all"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-800">
                {opt.value.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>

          {user && (
            <button
              onClick={logout}
              className="p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
              aria-label="Logout"
            >
              <LogOut className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 transition-all"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-800">
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>

          {user && (
            <button
              onClick={logout}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
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
              onClick={() => setMobileSearchOpen(false)}
              className="text-zinc-400 hover:text-white"
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
