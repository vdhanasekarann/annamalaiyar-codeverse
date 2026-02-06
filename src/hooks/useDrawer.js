import { useState, useCallback } from "react";

export function useDrawer() {
  const [open, setOpen] = useState(false);

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const toggleDrawer = useCallback(
    () => setOpen((v) => !v),
    []
  );

  return { open, openDrawer, closeDrawer, toggleDrawer };
}
