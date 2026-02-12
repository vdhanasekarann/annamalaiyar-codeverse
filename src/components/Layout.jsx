import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import { useState } from "react";
import MobileDrawer from "./MobileDrawer";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (location.pathname === "/login") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar */}
      <div className="flex-shrink-0">
      {/* Sidebar */}
      <div className="hidden md:block">
      <SideBar />
      </div>
      </div>

      {/* Mobile */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
    <SideBar mobile onNavigate={() => setMobileOpen(false)} />
    </MobileDrawer>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-1 py-1">
            <Outlet />
            <Link
  to="/prompt-assistant"
  className="fixed bottom-6 right-6 z-50
             bg-indigo-600 hover:bg-indigo-700
             text-white p-4 rounded-full shadow-xl"
>
  🤖
</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
