import { Link,useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export default function ExpandSidebar({items=[],mobile,onNavigate}){

 const {isExpanded,setCollapsed}=useSidebar();
 const location=useLocation();

 const open = mobile ? isExpanded : isExpanded;

 return(
 <aside
 className={`
 fixed top-[64px] left-[72px] bottom-0
 transition-all duration-300 ease-out
 ${open?"w-[240px]":"w-0"}
 overflow-hidden
 z-30
 `}
 >
  <div className="h-full backdrop-blur-xl bg-black/70 border-r border-white/10 p-4">

   {items.map(i=>(
     <Link
       key={i.path}
       to={i.path}
       onClick={()=>mobile && (setCollapsed(true), onNavigate?.())}
       className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition
       ${location.pathname===i.path?"bg-indigo-600/40":"hover:bg-white/10"}`}
     >
       <span className="text-lg">{i.icon}</span>
       <span className="text-sm font-medium">{i.label}</span>
     </Link>
   ))}

  </div>
 </aside>
 );
}
