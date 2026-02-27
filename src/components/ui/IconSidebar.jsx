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
        bg-black/55 backdrop-blur-2xl
        border-r border-white/15
        z-[60]
        transition-transform
        will-change-transform
        shadow-[0_18px_45px_rgba(0,0,0,0.45)]
      "
    >
      <div
        onClick={() => mobile && setCollapsed(false)}
        className="w-12 h-12 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition"
      >
        <img
          src="/AICodeverse.png"
          alt="CodeVerse AI OS"
          className="w-9 h-9 rounded-lg object-cover"
        />
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
                ? "bg-indigo-500/45 text-white scale-105 border border-indigo-300/50"
                : "text-white/85 hover:bg-white/12 border border-transparent"}
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
