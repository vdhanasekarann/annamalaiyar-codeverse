export default function MobileSidebar({ open, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/60 transition ${
        open ? "block" : "hidden"
      }`}
      onClick={onClose}
    >
      <aside
        className="absolute left-0 top-0 h-full w-64 bg-slate-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white font-bold mb-4">Annamalaiyar AI OS</h2>
        <nav className="space-y-3 text-slate-300">
          <a href="/dashboard">Dashboard</a>
          <a href="/profile">Profile</a>
          <a href="/billing">Billing</a>
          <button className="text-red-400">Logout</button>
        </nav>
      </aside>
    </div>
  );
}
