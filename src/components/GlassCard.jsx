import clsx from "clsx";

export default function GlassCard({
  children,
  theme = "gold",
  className = "",
  ...props
}) {
  const glow =
    theme === "gold"
      ? "shadow-[0_0_35px_rgba(255,215,0,0.25)] border-yellow-400/30"
      : "shadow-[0_0_35px_rgba(255,0,150,0.25)] border-pink-400/30";

  return (
    <div
      className={clsx(
        "rounded-3xl backdrop-blur-xl bg-white/5 border transition-all duration-300 hover:scale-[1.02]",
        glow,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
