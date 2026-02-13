
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "../config/api";
import { apiFetch } from "../lib/apiFetch";
import i18n from "../i18n";

export default function TopBar({ onOpenMobileMenu }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
      apiFetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  // ✅ FIX: await is now inside async function
  const logout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    navigate("/login");
  };

  return (
  <header className="flex items-center justify-between px-4 h-14 border-b border-white/10 bg-[#0f0f0f]">
    
    {/* LEFT */}
    <div className="flex items-center gap-2">
      <button
        className="md:hidden p-2 rounded hover:bg-white/10"
        onClick={onOpenMobileMenu}
      >
        ☰
      </button>

      <Link to="/" className="font-semibold text-base whitespace-nowrap">
        CodeVerse AI OS
      </Link>
    </div>
{/* CENTER – HIDDEN ON MOBILE */}
    <div className="hidden md:flex flex-1 justify-center px-6">
  <input
    type="text"
    placeholder="Search GPTs..."
    className="w-full max-w-md bg-zinc-800 border border-white/10
               rounded-full px-4 py-1 text-sm focus:outline-none"
  />
</div>

    {/* RIGHT – SHOWN ON ALL DEVICES */}
    {user && (
      <div className="flex items-center gap-2 md:gap-4 text-sm">

        {/* PLAN BADGE */}
        <span className="px-2 py-1 rounded bg-zinc-800 text-xs md:text-sm">
          {user.plan?.toUpperCase()}
        </span>

        <Link
  to="/prompt-assistant"
  className="hidden md:block px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-xs"
>
  🤖 Ask AI
</Link>

        {/* ROLE – HIDDEN ON SMALL */}
        <span className="hidden md:block opacity-80">
          {user.role === "admin" ? "Admin" : "User"}
        </span>
<select onChange={(e) => i18n.changeLanguage(e.target.value)}>
  <option value="en">EN</option>
  <option value="ta">தமிழ்</option>
  <option value="hi">हिंदी</option>
 <option value="ml">മലയാളം</option>
  <option value="kn">ಕನ್ನಡ</option>
   <option value="te">తెలుగు</option>
</select>

        {/* UPGRADE BUTTON – ALWAYS VISIBLE */}
        {user.plan === "free" && (
          <Link
            to="/premium"
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-xs md:text-sm"
          >
            Upgrade
          </Link>
        )}

        {/* LOGOUT – ICON ONLY ON MOBILE */}
        <button
          onClick={logout}
          className="text-red-400 hover:text-red-300 text-xs md:text-sm"
        >
          <span className="md:hidden">🚪</span>
          <span className="hidden md:inline">Logout</span>
        </button>

      </div>
    )}
  </header>
);
}
