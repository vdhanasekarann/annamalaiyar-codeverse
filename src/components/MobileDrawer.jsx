export default function MobileDrawer({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 bg-zinc-950 h-full shadow-xl animate-slideIn">
        {children}
      </div>
    </div>
  );
}
