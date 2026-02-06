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
    <header className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded hover:bg-white/10"
          onClick={onOpenMobileMenu}
        >
          ☰
        </button>

        <Link to="/" className="font-bold text-lg">
          CodeVerse AI OS
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-4 text-sm">
          <span className="px-2 py-1 rounded bg-zinc-800">
            {user.plan?.toUpperCase()}
          </span>

          <span>{user.role === "admin" ? "Admin" : "User"}</span>

          {user.plan === "free" && (
            <Link
              to="/premium"
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700"
            >
              Upgrade
            </Link>
          )}

          <div className="flex items-center gap-2">
  <img
    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.email
    )}&background=4f46e5&color=fff`}
    alt="avatar"
    className="w-8 h-8 rounded-full border border-white/20"
  />
  <span className="text-indigo-400">{user.email}</span>
</div>

          <button onClick={logout} className="text-red-400">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
