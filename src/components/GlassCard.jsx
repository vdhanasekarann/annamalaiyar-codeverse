import clsx from "clsx";

export default function GlassCard({
 children,
 theme="gold",
 className="",
 ...props
}){

 const themeMap={
  gold:"glass-card glass-card--gold",
  pink:"glass-card glass-card--pink",
  blue:"glass-card glass-card--blue",
  dark:"glass-card glass-card--dark"
 };

 return(
 <div
 className={clsx(themeMap[theme]||themeMap.gold,className)}
 {...props}
 >
 {children}
 </div>
 );
}
