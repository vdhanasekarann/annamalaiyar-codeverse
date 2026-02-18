import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export default function ExpandSidebar({ items = [], mobile = false, onNavigate }) {
  const { collapsed, hovered, locked } = useSidebar();
  const expanded = mobile ? !collapsed : locked || hovered || !collapsed;
  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-[72px] z-40 h-screen text-white transition-all duration-300
      ${expanded ? "w-[260px]" : "w-0 overflow-hidden"}`}
    >
      <div className="h-full backdrop-blur-xl bg-black/30 border-r border-white/10 p-3 flex flex-col">
        <div className="mb-4 px-2 text-sm font-semibold">CodeVerse AI OS</div>

        <nav className="flex-1 space-y-2">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && onNavigate?.()}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
              ${
                location.pathname === item.path
                  ? "bg-indigo-600/40"
                  : "hover:bg-white/10"
              }`}
            >
              <span className="w-6">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
