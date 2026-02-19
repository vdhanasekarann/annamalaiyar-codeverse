import IconSidebar from "./IconSidebar";
import ExpandSidebar from "./ExpandSidebar";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function DoubleSidebar({ mobile=false, onNavigate }) {
  const { setCollapsed } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const items = [
    { path:"/dashboard", label:"Home", icon:"🏠" },
    { path:"/gpts", label:"GPT Apps", icon:"🤖" },
    { path:"/terms", label:"Terms", icon:"📄" },
    { path:"/premium", label:"Premium", icon:"💎" }
  ];

  if(user?.role==="admin"){
    items.push(
      { path:"/admin/revenue", label:"Revenue", icon:"📊" },
      { path:"/admin/users", label:"Users", icon:"👥" }
    );
  }

  if (mobile) {
    return (
      <aside className="h-full bg-black/80 backdrop-blur-xl border-r border-white/10 px-3 py-4">
        <nav className="space-y-1">
          {items.map((i) => (
            <Link
              key={i.path}
              to={i.path}
              onClick={() => {
                setCollapsed(true);
                onNavigate?.();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white ${
                location.pathname === i.path ? "bg-indigo-600/40" : "hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{i.icon}</span>
              <span className="text-sm font-medium">{i.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <>
      <IconSidebar items={items} mobile={mobile}/>
      <ExpandSidebar items={items} mobile={mobile} onNavigate={onNavigate}/>
    </>
  );
}
