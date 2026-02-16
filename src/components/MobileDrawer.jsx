export default function MobileDrawer({ open, onClose, children }) {
  return (
    <div
      className={`
      fixed inset-0 z-50 transition-all md:hidden
      ${open ? "opacity-100 visible" : "opacity-0 invisible"}
    `}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
        absolute left-0 top-0 h-full w-[260px] max-w-[80%]
        bg-white/4 backdrop-blur-xl border-r border-white/10 transition-transform
        ${open ? "translate-x-0 shadow-lg" : "-translate-x-full"}
      `}
      >
        {children}
      </div>
    </div>
  );
}
