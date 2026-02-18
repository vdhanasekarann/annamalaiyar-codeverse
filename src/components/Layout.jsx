import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import { useAuth } from "../context/AuthContext";
import MobileDrawer from "./MobileDrawer";
import DoubleSidebar from "./ui/DoubleSidebar";
import { useSidebar } from "../context/SidebarContext";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const [bg, setBg] = useState(null);
  const { collapsed } = useSidebar();
  const location = useLocation();

  if (location.pathname === "/login") return null;

  useEffect(() => {
    if (!user) return setBg(null);
    const key = `bg_${user.email}`;
    setBg(localStorage.getItem(key));
  }, [user]);

  useEffect(() => {
    if (!document) return;
    document.body.style.backgroundImage = `url('${bg || "/bg-galaxy.jpg"}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  }, [bg]);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* SIDEBAR SYSTEM */}
      <div className="hidden md:block">
        <DoubleSidebar />
      </div>

      {/* MOBILE SIDEBAR */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <DoubleSidebar mobile onNavigate={()=>setMobileOpen(false)} />
      </MobileDrawer>

      {/* MAIN AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "md:pl-[72px]" : "md:pl-[240px]"}`}>
        
        <TopBar onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="page-container p-6 rounded-3xl min-h-screen">
              <Outlet />
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
