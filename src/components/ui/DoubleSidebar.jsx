import IconSidebar from "./IconSidebar";
import ExpandSidebar from "./ExpandSidebar";
import BackdropOverlay from "./BackdropOverlay";
import { useSidebar } from "../../context/SidebarContext";

export default function DoubleSidebar({ items = [], mobile=false, onNavigate }) {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <>
      <IconSidebar items={items} mobile={mobile} />
      <ExpandSidebar items={items} mobile={mobile} onNavigate={onNavigate} />
      {mobile && !collapsed && (
        <BackdropOverlay onClick={() => setCollapsed(true)} />
      )}
    </>
  );
}
