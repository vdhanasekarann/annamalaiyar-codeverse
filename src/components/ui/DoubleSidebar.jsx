import IconSidebar from "./IconSidebar";
import ExpandSidebar from "./ExpandSidebar";
import BackdropOverlay from "./BackdropOverlay";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";

export default function DoubleSidebar({ mobile=false, onNavigate }) {
  const { collapsed, setCollapsed } = useSidebar();
  const { user } = useAuth();

  const items = [
    { path:"/dashboard", label:"Home", icon:"🏠" },
    { path:"/gpts", label:"GPT Apps", icon:"🤖" },
    { path:"/terms", label:"Terms", icon:"📄" },
    { path:"/premium", label:"Premium", icon:"💎" }
  ];

  if(user?.role==="admin"){
    items.push(
      { path:"/admin/revenue", label:"Revenue", icon:"📊" },
      { path:"/admin/users", label:"Users", icon:"👥" }
    );
  }

  return (
    <>
      <IconSidebar items={items} mobile={mobile}/>
      <ExpandSidebar items={items} mobile={mobile} onNavigate={onNavigate}/>
      {mobile && !collapsed && <BackdropOverlay onClick={()=>setCollapsed(true)}/>}
    </>
  );
}
