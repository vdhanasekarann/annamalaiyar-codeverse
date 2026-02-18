import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export default function ExpandSidebar({ items, mobile, onNavigate }) {
  const { isExpanded, setCollapsed } = useSidebar();
  const location = useLocation();

  return (
    <aside
      className={`
      fixed top-0 left-[72px] h-screen
      transition-all duration-300 ease-in-out
      ${isExpanded ? "w-[240px]" : "w-0"}
      overflow-hidden z-30
      `}
    >
      <div className="h-full backdrop-blur-xl bg-black/70 border-r border-white/10 p-4">
        {(items || []).map((i) => (
          <Link
            key={i.path}
            to={i.path}
            onClick={() => {
              if (mobile) {
                setCollapsed(true);
                onNavigate?.();
              }
            }}
            className={`
            flex gap-3 px-3 py-2 rounded-lg mb-2
            ${
              location.pathname === i.path
                ? "bg-indigo-600/40"
                : "hover:bg-white/10"
            }
            `}
          >
            <span>{i.icon}</span>
            <span>{i.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
