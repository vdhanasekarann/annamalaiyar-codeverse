import { useRef, useEffect } from "react";
import clsx from "clsx";
import { animateFloat, ripple } from "../lib/motion";

export default function GlassCard({
  children,
  theme="gold",
  className="",
  motion=true,
  ...props
}) {
  const ref = useRef();

  useEffect(()=>{
    if(!motion) return;
    return animateFloat(ref.current,8);
  },[motion]);

  const themeMap={
    gold:"glass-card--gold",
    pink:"glass-card--pink",
    blue:"glass-card--blue",
    dark:"glass-card--dark"
  };

  return (
    <div
      ref={ref}
      onClick={ripple}
      className={clsx(
        "glass-card motion glow-hover relative",
        themeMap[theme] || themeMap.gold,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
