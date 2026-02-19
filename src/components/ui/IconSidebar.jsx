import { Link,useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

export default function IconSidebar({items=[],mobile}){

 const {setHovered,setCollapsed}=useSidebar();
 const location=useLocation();

 return(
 <div
 onMouseEnter={()=>!mobile && setHovered(true)}
 onMouseLeave={()=>!mobile && setHovered(false)}
 onMouseMove={(e)=>{
 const y=e.clientY/20;
 e.currentTarget.style.transform=`translateY(${y}px)`;
}}
 className="
 fixed left-0 top-[64px] bottom-0
 w-[72px] flex flex-col items-center py-4
 backdrop-blur-xl bg-black/40
 border-r border-white/10
 z-40
 "
 >

  <div
   onClick={()=>mobile && setCollapsed(false)}
   className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold cursor-pointer">
   CV
  </div>

  <nav className="mt-6 flex flex-col gap-2">
   {items.map(it=>(
    <Link
     key={it.path}
     to={it.path}
     className={`w-12 h-12 flex items-center justify-center rounded-lg transition
     ${location.pathname===it.path
       ?"bg-indigo-600 text-white"
       :"text-white/80 hover:bg-white/10"}`}
    >
      <span className="text-xl">{it.icon}</span>
    </Link>
   ))}
  </nav>

 </div>
 );
}
