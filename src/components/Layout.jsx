import React from "react";
import { Link, Outlet, Navigate, useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import { useState } from "react";
import MobileDrawer from "./MobileDrawer";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (location.pathname === "/login") return null;

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
              className="glass p-6 rounded-3xl min-h-screen"
              style={{
                backgroundImage: "url('/bg-galaxy.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
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

      {/* Right slim secondary sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-20 items-center gap-4 py-6 bg-white/3 backdrop-blur border-l border-white/6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-white">A</div>
        <button className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center hover:bg-white/10">🔔</button>
        <button className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center hover:bg-white/10">⚙️</button>
      </aside>
    </div>
  );
}
