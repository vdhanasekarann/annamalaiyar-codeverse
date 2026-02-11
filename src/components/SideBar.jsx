// src/components/SideBar.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";

export default function SideBar({ mobile, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;

    apiFetch("/api/auth/me")
      .then(async res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (!alive) return;

        setUser(data);
        setRole(data?.role || "user");
      })
      .catch(() => {
        if (!alive) return;
        setRole("user");
        setUser(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (location.pathname === "/login") return null;
  if (role === null) return null;

  const linkClass = (active) =>
    `flex items-center gap-2 px-3 py-2 rounded text-sm ${
      active
        ? "bg-indigo-600 text-white"
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;

  const go = (path) => {
    navigate(path);
    if (mobile && onNavigate) onNavigate();
  };

  return (
  <aside className="w-60 md:w-44 h-screen flex flex-col bg-black/60 backdrop-blur border-r border-white/10">

    {/* BRAND */}
    <div className="p-4 font-semibold text-white border-b border-white/10">
      CodeVerse AI OS
    </div>

    {/* USER PROFILE (NEW) */}
    {mobile && user && (
  <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.email || "User"
          )}&background=4f46e5&color=fff`}
          className="w-10 h-10 rounded-full"
        />
        <div className="text-sm">
          <div className="text-indigo-400 truncate">
            {user?.email}
          </div>
          <div className="opacity-60 text-xs">
            {role?.toUpperCase()}
          </div>
        </div>
      </div>
    )}

    <nav className="flex-1 px-3 py-4 space-y-2">
        <button onClick={() => go("/dashboard")} className={linkClass(location.pathname === "/dashboard")}>
          🧠 Dashboard
        </button>

        <button onClick={() => go("/gpts")} className={linkClass(location.pathname === "/gpts")}>
          🤖 GPT Apps
        </button>

        <button onClick={() => go("/premium")} className={linkClass(location.pathname === "/premium")}>
          💎 Premium
        </button>

        {role === "admin" && (
          <>
            <button onClick={() => go("/admin/revenue")} className={linkClass(location.pathname === "/admin/revenue")}>
              📊 Revenue
            </button>
            <button onClick={() => go("/admin/users")} className={linkClass(location.pathname === "/admin/users")}>
              👥 Users
            </button>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={async () => {
            await apiFetch("/api/auth/logout", { method: "POST" });
            navigate("/login");
          }}
          className="w-full text-left text-red-400 hover:text-red-300"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
