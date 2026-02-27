import IconSidebar from "./IconSidebar";
import ExpandSidebar from "./ExpandSidebar";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SidebarProfile from "../SidebarProfile";
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
      <aside className="h-full px-3 py-4 flex flex-col text-white">
        <div className="mb-3 rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <img
              src="/AICodeverse.png"
              alt="CodeVerse AI OS"
              className="h-9 w-9 rounded-xl border border-white/15 object-cover"
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">Workspace</p>
              <p className="text-sm font-semibold leading-tight">CodeVerse AI OS</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
          {items.map((i) => (
            <Link
              key={i.path}
              to={i.path}
              onClick={() => {
                setCollapsed(true);
                onNavigate?.();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                location.pathname === i.path
                  ? "border-indigo-300/50 bg-indigo-500/30 shadow-[0_0_24px_rgba(99,102,241,0.35)]"
                  : "border-white/10 bg-white/5 hover:bg-white/12"
              }`}
            >
              <i.icon className="w-5 h-5 shrink-0" strokeWidth={2.2} />
              <span className="text-sm font-medium leading-none">{i.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
          <SidebarProfile compact />
        </div>
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
