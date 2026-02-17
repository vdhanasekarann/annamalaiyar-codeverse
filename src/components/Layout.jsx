import React, { useEffect, useState } from "react";
import { Link, Outlet, Navigate, useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import { useAuth } from "../context/AuthContext";
import MobileDrawer from "./MobileDrawer";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const [bg, setBg] = useState(null);

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

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#050816] to-[#0b0b0b]">
      {/* Left Sidebar */}
      <div className="flex-shrink-0 hidden md:block">
        <SideBar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SideBar mobile onNavigate={() => setMobileOpen(false)} />
      </MobileDrawer>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div
              className="glass p-6 rounded-3xl min-h-screen relative overflow-hidden"
              style={{
                backgroundImage: bg ? `url('${bg}')` : "url('/bg-galaxy.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* full-bleed blur overlay for consistent glass effect */}
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[12px] pointer-events-none" />
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
