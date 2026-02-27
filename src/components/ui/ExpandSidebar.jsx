import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import SidebarProfile from "../SidebarProfile";

function isRenderableIcon(icon) {
  return typeof icon === "function" || (typeof icon === "object" && icon !== null);
}

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
        z-[60]
      `}
    >
      <div className="h-full bg-black/65 backdrop-blur-2xl border-r border-white/15 px-3 py-4 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.45)]">

        <div className="space-y-1 flex-1">
          {items.map((i) => (
          <Link
            key={i.path}
            to={i.path}
            onClick={() => mobile && (setCollapsed(true), onNavigate?.())}
            className={`
              flex items-center gap-3 px-4 py-2 rounded-lg mb-2
              text-white whitespace-nowrap
              transition-all duration-200
              ${location.pathname === i.path
                ? "bg-indigo-500/35 border border-indigo-300/45 shadow-[0_0_22px_rgba(99,102,241,0.28)]"
                : "hover:bg-white/10 border border-transparent"}
            `}
          >
            <span className="w-6 flex justify-center items-center leading-none shrink-0">
              {isRenderableIcon(i.icon) ? (
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

        <SidebarProfile />

      </div>
    </aside>
  );
}
