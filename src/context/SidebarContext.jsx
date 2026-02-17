import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);

  const lock = () => setLocked(true);
  const unlock = () => setLocked(false);
  const toggleCollapse = () => setCollapsed((c) => !c);

  return (
    <SidebarContext.Provider value={{ collapsed, hovered, locked, setHovered, setCollapsed, lock, unlock, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
