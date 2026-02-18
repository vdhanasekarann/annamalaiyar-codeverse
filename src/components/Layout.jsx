import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import { useAuth } from "../context/AuthContext";
import MobileDrawer from "./MobileDrawer";
import SideBar from "./SideBar"; // ✅ use only this
import { useSidebar } from "../context/SidebarContext";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const [bg, setBg] = useState(null);
  const { collapsed } = useSidebar();
  const location = useLocation();

  if (location.pathname === "/login") return null;

  useEffect(()=>{
 const move=e=>{
  document.body.style.setProperty("--x",e.clientX+"px");
  document.body.style.setProperty("--y",e.clientY+"px");
 };
 window.addEventListener("mousemove",move);
 return()=>window.removeEventListener("mousemove",move);
},[]);

  /* ---------- LOAD BACKGROUND ---------- */
  useEffect(() => {
    function loadBg() {
      try {
        if (!user) return setBg(null);
        const key = `bg_${user.email}`;
        const val = localStorage.getItem(key);
        setBg(val || null);
      } catch {
        setBg(null);
      }
    }
    loadBg();
    window.addEventListener("bgChange", loadBg);
    window.addEventListener("storage", loadBg);
    return () => {
      window.removeEventListener("bgChange", loadBg);
      window.removeEventListener("storage", loadBg);
    };
  }, [user]);

  /* ---------- APPLY BODY BG ---------- */
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.backgroundImage = `url('${bg || "/bg-galaxy.jpg"}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backdropFilter = "";
    }
    return () => {
      document.body.style.backgroundImage = "";
    };
  }, [bg]);

  return (
    <div
 onMouseMove={(e)=>{
  const x=(e.clientX/window.innerWidth-.5)*10;
  const y=(e.clientY/window.innerHeight-.5)*10;
  document.body.style.backgroundPosition=`${50+x}% ${50+y}%`;
 }}
>
      {/* SIDEBAR */}
      <div className="relative">
  <div className="hidden md:block">
    <IconSidebar items={items} />
    <ExpandSidebar items={items} />
  </div>

  <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
    <ExpandSidebar items={items} mobile />
  </MobileDrawer>
</div>

      {/* MAIN CONTENT */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          collapsed ? "md:pl-[72px]" : "md:pl-[312px]"
        }`}
      >
        <TopBar onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="page-container p-6 rounded-3xl min-h-screen relative overflow-hidden">
              <div className="relative z-10">
                <Outlet />
              </div>
            </div>

            {/* Floating Assistant */}
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
