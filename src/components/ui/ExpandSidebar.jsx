import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export default function ExpandSidebar({ items = [], mobile, onNavigate }) {
  const { isExpanded, setCollapsed } = useSidebar();
  const location = useLocation();

  const open = mobile ? isExpanded : isExpanded;

  return (
    <aside
      className={`
        fixed left-[72px] top-16 bottom-0
        transition-all duration-300 ease-out
        ${open ? "w-[240px] opacity-100" : "w-0 opacity-0"}
        z-30
      `}
    >
      <div className="h-full bg-black/60 backdrop-blur-lg border-r border-white/10 px-3 py-4 space-y-1">

        {items.map((i) => (
          <Link
            key={i.path}
            to={i.path}
            onClick={() => mobile && (setCollapsed(true), onNavigate?.())}
            className={`
              flex items-center gap-3 px-4 py-2 rounded-lg mb-2
              text-white whitespace-nowrap
              transition-all duration-200
              ${location.pathname === i.path ? "bg-indigo-600/40" : "hover:bg-white/10"}
            `}
          >
            <span className="w-6 flex justify-center items-center leading-none shrink-0">
              {typeof i.icon === "function" ? (
                <i.icon className="w-5 h-5" strokeWidth={2.2} />
              ) : (
                i.icon
              )}
            </span>

            <span className="text-sm font-medium tracking-wide leading-none">
              {i.label}
            </span>
          </Link>

        ))}

      </div>
    </aside>
  );
}
