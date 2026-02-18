import clsx from "clsx";

export default function GlassCard({
  children,
  theme="gold",
  className="",
  ...props
}){

 const themeClass =
  theme==="gold"
   ? "glass-card--gold"
   : theme==="pink"
   ? "glass-card--pink"
   : "glass-card--blue";

 return(
  <div
   className={clsx("glass-card", themeClass, className)}
   {...props}
  >
   {children}
  </div>
 );
}
