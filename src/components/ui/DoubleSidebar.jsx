import IconSidebar from "./IconSidebar";
import ExpandSidebar from "./ExpandSidebar";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bot,
  ChartColumn,
  FileText,
  Gem,
  House,
  Users,
} from "lucide-react";

export default function DoubleSidebar({ mobile = false, onNavigate }) {
  const { setCollapsed } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const items = [
    { path: "/dashboard", label: t("home") || "Home", icon: House },
    { path: "/gpts", label: t("gptApps") || "GPT Apps", icon: Bot },
    { path: "/terms", label: t("terms") || "Terms", icon: FileText },
    { path: "/premium", label: t("premium") || "Premium", icon: Gem },
  ];

  if (user?.role === "admin") {
    items.push(
      { path: "/admin/revenue", label: t("revenue") || "Revenue", icon: ChartColumn },
      { path: "/admin/users", label: t("users") || "Users", icon: Users }
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
              <i.icon className="w-5 h-5 shrink-0" strokeWidth={2.2} />
              <span className="text-sm font-medium leading-none">{i.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <>
      <IconSidebar items={items} mobile={mobile} />
      <ExpandSidebar items={items} mobile={mobile} onNavigate={onNavigate} />
    </>
  );
}
