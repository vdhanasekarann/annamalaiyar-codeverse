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
  <aside
    className="
      w-[240px] md:w-[200px]
      h-screen flex flex-col
      bg-[#0f0f0f]
      border-r border-white/10
      overflow-hidden text-white
    "
  >
    {/* BRAND */}
    <div className="px-4 py-3 font-semibold text-base border-b border-white/10">
      CodeVerse AI OS
    </div>

    {/* USER PROFILE */}
    {user && (
      <div className="px-3 py-3 border-b border-white/10 flex items-center gap-3">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.email || "User"
          )}&background=4f46e5&color=fff`}
          className="w-9 h-9 rounded-full"
        />

        <div className="min-w-0">
          <div className="text-sm truncate max-w-[150px] text-white">
            {user?.email}
          </div>
          <div className="text-[11px] text-white/60">
            {role?.toUpperCase()}
          </div>
        </div>
      </div>
    )}

    <nav className="flex-1 px-2 py-3 space-y-1">
      {[
        { path: "/dashboard", label: "Home", icon: "🏠" },
        { path: "/gpts", label: "GPT Apps", icon: "🤖" },
        { path: "/premium", label: "Premium", icon: "💎" },
      ].map((item) => (
        <button
          key={item.path}
          onClick={() => go(item.path)}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full
            ${
              location.pathname === item.path
                ? "bg-white/15 font-medium"
                : "hover:bg-white/10"
            }
          `}
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </button>
      ))}

      {role === "admin" && (
        <>
          <div className="border-t border-white/10 my-2" />

          <button
            onClick={() => go("/admin/revenue")}
            className={linkClass(location.pathname === "/admin/revenue")}
          >
            📊 Revenue
          </button>

          <button
            onClick={() => go("/admin/users")}
            className={linkClass(location.pathname === "/admin/users")}
          >
            👥 Users
          </button>
        </>
      )}
    </nav>

    <div className="p-3 border-t border-white/10">
      <button
        onClick={async () => {
          await apiFetch("/api/auth/logout", { method: "POST" });
          navigate("/login");
        }}
        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 w-full"
      >
        🚪 Logout
      </button>
    </div>
  </aside>
);
}
