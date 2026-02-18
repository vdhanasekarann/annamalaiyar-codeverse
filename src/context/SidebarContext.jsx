import { createContext, useContext, useState } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const isExpanded = hovered || !collapsed;

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        hovered,
        setHovered,
        isExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
}
