import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bot } from "lucide-react";
import TopBar from "./TopBar";
import { useAuth } from "../context/AuthContext";
import MobileDrawer from "./MobileDrawer";
import DoubleSidebar from "./ui/DoubleSidebar";
import { useSidebar } from "../context/SidebarContext";
import { getBackgroundObjectUrl } from "../utils/backgroundStorage";
import { useSafeArea } from "../hooks/useSafeArea";

function sanitizeBackgroundSource(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }
  return null;
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const [bg, setBg] = useState(null);
  const { collapsed, setCollapsed } = useSidebar();
  const { headerHeight, shouldUseSafeArea } = useSafeArea();
  const location = useLocation();
  const showPromptAssistant = !location.pathname.startsWith("/admin/");

  useEffect(() => {
    if (!user) {
      setBg(null);
      return;
    }

    let activeUrl = null;
    let disposed = false;
    const key = `bg_${user.email}`;

    const syncBg = async () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
        activeUrl = null;
      }

      try {
        const objectUrl = await getBackgroundObjectUrl(user.email);
        if (disposed) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          return;
        }
        if (objectUrl) {
          activeUrl = objectUrl;
          setBg(objectUrl);
          return;
        }
      } catch {
        // Fallback to localStorage only if IndexedDB path is unavailable.
      }

      const legacyBg = localStorage.getItem(key);
      const safeLegacyBg = sanitizeBackgroundSource(legacyBg);
      if (!safeLegacyBg && legacyBg) {
        localStorage.removeItem(key);
      }
      setBg(safeLegacyBg);
    };

    syncBg();
    window.addEventListener("bgChange", syncBg);
    return () => {
      disposed = true;
      window.removeEventListener("bgChange", syncBg);
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [user]);

  useEffect(() => {
    document.body.style.backgroundImage = `url('${bg || "/bg-galaxy.jpg"}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  }, [bg]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - Fixed position below TopBar */}
      <div className="hidden md:block fixed top-0 left-0 z-[60]" style={{ paddingTop: `${headerHeight}px` }}>
        <DoubleSidebar />
      </div>

      <MobileDrawer
        open={mobileOpen}
        topOffset={headerHeight}
        onClose={() => {
          setMobileOpen(false);
          setCollapsed(true);
        }}
      >
        <DoubleSidebar mobile onNavigate={() => setMobileOpen(false)} />
      </MobileDrawer>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "md:ml-[72px]" : "md:ml-[240px]"
        }`}
      >
        <TopBar
          onOpenMobileMenu={() => {
            setCollapsed(false);
            setMobileOpen(true);
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div 
            className="max-w-7xl mx-auto px-4 pb-24 sm:pb-8"
            style={{ paddingTop: `${headerHeight + 16}px` }}
          >
            <div className="page-container p-3 sm:p-6 rounded-3xl min-h-screen">
              <Outlet />
            </div>

            {showPromptAssistant && (
              <Link
                to="/prompt-assistant"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl"
                aria-label="Open Prompt Assistant"
              >
                <Bot className="w-5 h-5" />
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
