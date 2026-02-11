import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "../config/api";
import { apiFetch } from "../lib/apiFetch";

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
  <header className="flex items-center justify-between px-4 h-14 border-b border-white/10 bg-black">
    
    {/* LEFT SECTION */}
    <div className="flex items-center gap-2">
      <button
        className="md:hidden p-2 rounded hover:bg-white/10"
        onClick={onOpenMobileMenu}
      >
        ☰
      </button>

      <Link to="/" className="font-bold text-base md:text-lg whitespace-nowrap">
        CodeVerse AI OS
      </Link>
    </div>

    {/* RIGHT SECTION - ONLY DESKTOP */}
    {user && (
      <div className="hidden md:flex items-center gap-4 text-sm">
        
        <span className="px-2 py-1 rounded bg-zinc-800">
          {user.plan?.toUpperCase()}
        </span>

        <span className="opacity-80">
          {user.role === "admin" ? "Admin" : "User"}
        </span>

        {user.plan === "free" && (
          <Link
            to="/premium"
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700"
          >
            Upgrade
          </Link>
        )}

        <button onClick={logout} className="text-red-400 hover:text-red-300">
          Logout
        </button>
      </div>
    )}
  </header>
);
}
