import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';

export default function IconSidebar({ items = [] }) {
  const { hovered, setHovered } = useSidebar();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed left-0 top-0 z-40 h-screen w-[72px] flex flex-col items-center gap-3 py-4 bg-transparent"
    >
      <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold">CV</div>
      <nav className="mt-4 flex flex-col gap-2">
        {items.map((it) => (
          <Link key={it.path} to={it.path} className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white/6 text-white/90">
            <span className="text-lg">{it.icon}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
