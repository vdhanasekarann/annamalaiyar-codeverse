import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

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

export const useSidebar = () => useContext(SidebarContext);
