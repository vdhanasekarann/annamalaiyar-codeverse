import React, { useEffect, useState } from "react";
import { Link, Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import IconSidebar from "./ui/IconSidebar";
import ExpandSidebar from "./ui/ExpandSidebar";
import TopBar from "./TopBar";
import { useAuth } from "../context/AuthContext";
import MobileDrawer from "./MobileDrawer";
import { useSidebar } from "../context/SidebarContext";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const [bg, setBg] = useState(null);
  const { collapsed } = useSidebar();
  const location = useLocation();

  if (location.pathname === "/login") return null;

  useEffect(() => {
    function loadBg() {
      try {
        if (!user) return setBg(null);
        const key = `bg_${user.email}`;
        const val = localStorage.getItem(key);
        setBg(val || null);
      } catch (e) {
        setBg(null);
      }
    }
    loadBg();
    const onChange = () => loadBg();
    window.addEventListener("bgChange", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("bgChange", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [user]);

  // Apply background image to the document body (page background only)
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (bg) {
        document.body.style.backgroundImage = `url('${bg}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
      } else {
        document.body.style.backgroundImage = "url('/bg-galaxy.jpg')";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
      }
      // ensure body doesn't get blurred
      document.body.style.backdropFilter = "";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.backgroundImage = "";
        document.body.style.backgroundSize = "";
        document.body.style.backgroundPosition = "";
      }
    };
  }, [bg]);

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#050816] to-[#0b0b0b]">
      {/* LEFT SIDEBAR - Icon bar + Expandable panel (single source of truth) */}
      <div className="relative">
        {/* Desktop sidebars: hidden on small screens to avoid duplicate mobile drawer */}
        <div className="hidden md:block">
          <IconSidebar />
          <ExpandSidebar />
        </div>

        {/* Mobile drawer shows expanded sidebar on small screens */}
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <ExpandSidebar mobile onNavigate={() => setMobileOpen(false)} />
        </MobileDrawer>
      </div>

      {/* Main area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'md:pl-16' : 'md:pl-60'}`}>
        <TopBar onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="page-container p-6 rounded-3xl min-h-screen relative overflow-hidden">
              <div className="relative z-10">
                <Outlet />
              </div>
            </div>
            <Link
              to="/prompt-assistant"
              className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl"
            >
              🤖
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
