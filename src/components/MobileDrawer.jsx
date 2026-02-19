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
        className="absolute inset-x-0 top-16 bottom-0 bg-black/60"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
        absolute left-0 top-16 h-[calc(100%-4rem)] w-[260px] max-w-[80%]
        glass-dark transition-transform
        ${open ? "translate-x-0 shadow-lg" : "-translate-x-full"}
      `}
      >
        {children}
      </div>
    </div>
  );
}
