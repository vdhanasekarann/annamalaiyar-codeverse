import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  // DESKTOP → hover expands
  // MOBILE → collapsed=false expands
  const isExpanded = hovered || !collapsed;

  const openMobile = () => setCollapsed(false);
  const closeMobile = () => setCollapsed(true);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        hovered,
        setHovered,
        isExpanded,
        openMobile,
        closeMobile
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
