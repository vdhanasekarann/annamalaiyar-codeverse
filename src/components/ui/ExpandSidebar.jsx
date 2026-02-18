import { Link,useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export default function ExpandSidebar({items=[],mobile,onNavigate}){
 const {collapsed}=useSidebar();
 const location=useLocation();

 const open = mobile ? !collapsed : true;

 return(
 <aside
   className={`
   fixed top-0 left-0 h-screen
   transition-transform duration-300
   ${open?"translate-x-0":"-translate-x-full"}
   w-[260px] z-50
   `}
 >
  <div className="h-full backdrop-blur-xl bg-black/70 border-r border-white/10 p-4">
   {items.map(i=>(
     <Link
       key={i.path}
       to={i.path}
       onClick={()=>mobile && onNavigate?.()}
       className={`
         flex gap-3 px-3 py-2 rounded-lg mb-2
         ${location.pathname===i.path?"bg-indigo-600/40":"hover:bg-white/10"}
       `}
     >
       <span>{i.icon}</span>
       <span>{i.label}</span>
     </Link>
   ))}
  </div>
 </aside>
 );
}
