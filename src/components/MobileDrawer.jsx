export default function MobileDrawer({ open, onClose, children, topOffset = 64 }) {
  return (
    <div
      className={`
      fixed inset-0 z-[70] transition-all md:hidden
      ${open ? "opacity-100 visible" : "opacity-0 invisible"}
    `}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
        absolute left-0
        w-[min(86vw,320px)]
        bg-[linear-gradient(165deg,rgba(10,14,30,0.96),rgba(6,8,16,0.94))]
        backdrop-blur-2xl border-r border-white/15
        rounded-r-2xl
        transition-transform duration-300 ease-out
        ${open ? "translate-x-0 shadow-[0_24px_60px_rgba(0,0,0,0.55)]" : "-translate-x-full"}
      `}
        style={{ top: `${topOffset}px`, height: `calc(100% - ${topOffset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
