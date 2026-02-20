import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

function isRenderableIcon(icon) {
  return typeof icon === "function" || (typeof icon === "object" && icon !== null);
}

export default function IconSidebar({ items = [], mobile }) {
  const { setHovered, setCollapsed } = useSidebar();
  const location = useLocation();

  return (
    <div
      onMouseEnter={() => !mobile && setHovered(true)}
      onMouseLeave={() => !mobile && setHovered(false)}
      onMouseMove={(e) => {
        if (mobile) return;
        const y = (e.clientY - window.innerHeight / 2) / 60;
        e.currentTarget.style.transform = `translateY(${y}px)`;
      }}
      className="
        fixed left-0 top-16 bottom-0
        w-[72px]
        flex flex-col items-center py-4 gap-2
        bg-black/40 backdrop-blur-xl
        border-r border-white/10
        z-40
        transition-transform
        will-change-transform
      "
    >
      <div
        onClick={() => mobile && setCollapsed(false)}
        className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition"
      >
        CV
      </div>

      <nav className="mt-4 flex flex-col gap-2">
        {items.map((it) => (
          <Link
            key={it.path}
            to={it.path}
            className={`
              w-12 h-12 flex items-center justify-center rounded-lg
              transition-all duration-200
              ${location.pathname === it.path
                ? "bg-indigo-600 text-white scale-105"
                : "text-white/80 hover:bg-white/10"}
            `}
          >
            {isRenderableIcon(it.icon) ? (
              <it.icon className="w-5 h-5" strokeWidth={2.2} />
            ) : (
              <span className="text-xl leading-none">{it.icon}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
