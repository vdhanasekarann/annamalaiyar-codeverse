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
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
        absolute left-0 top-0 h-full w-[260px] max-w-[80%]
        glass-dark transition-transform
        ${open ? "translate-x-0 shadow-lg" : "-translate-x-full"}
      `}
      >
        {children}
      </div>
    </div>
  );
}
