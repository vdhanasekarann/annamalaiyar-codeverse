import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import { useState } from "react";
import MobileDrawer from "./MobileDrawer";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
