import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';

export default function ExpandSidebar({ items = [], mobile=false, onNavigate }) {
  const { collapsed, hovered, locked, unlock } = useSidebar();
  const expanded = locked || hovered || !collapsed || mobile;
  const location = useLocation();

  return (
    <aside className={`fixed left-[72px] top-0 z-40 h-screen overflow-hidden text-white flex flex-col bg-transparent transition-all duration-200 ${expanded ? 'w-[260px]' : 'w-[72px]'}`} style={{ willChange: 'width' }}>
      <div className="glass-dark h-full border-r border-white/6 p-3 flex flex-col">
        <div className="mb-4 px-2">
          <div className="text-sm font-semibold">{expanded ? 'CodeVerse AI OS' : ''}</div>
        </div>

        <nav className="flex-1 space-y-2">
          {items.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => { if (mobile && onNavigate) onNavigate(); }} className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition ${location.pathname===item.path ? 'bg-indigo-600/40' : 'hover:bg-white/6'}`}>
              <span className="w-8 text-center">{item.icon}</span>
              {expanded && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

      </div>
    </aside>
  );
}
