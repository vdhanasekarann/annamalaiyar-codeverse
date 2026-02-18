import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export default function IconSidebar({ items = [] }) {
  const { setHovered } = useSidebar();
  const location = useLocation();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed left-0 top-0 z-40 h-screen w-[72px] flex flex-col items-center gap-3 py-4 backdrop-blur-md bg-black/20 border-r border-white/10"
    >
      <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
        CV
      </div>

      <nav className="mt-4 flex flex-col gap-2">
        {items.map((it) => (
          <Link
            key={it.path}
            to={it.path}
            className={`w-12 h-12 flex items-center justify-center rounded-lg transition
            ${
              location.pathname === it.path
                ? "bg-indigo-600 text-white"
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <span className="text-xl">{it.icon}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
