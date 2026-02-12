import { parseLimit } from "../config/limits";
import { apiFetch } from "../lib/apiFetch";

export default function GPTCard({ gpt, used, plan, onUsed }) {
  const limit = plan === "free" ? parseLimit(gpt.freeLimit) : Infinity;
  const locked = plan === "free" && used >= limit;

  const click = async () => {
    if (locked) return;

    await apiFetch("/api/usage", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gpt: gpt.id }),
    });

    // ✅ SAFE CALL
    if (onUsed) {
      await onUsed();
    }

    window.open(gpt.link, "_blank");
  };

  return (
  <div
    onClick={click}
    className={`group relative rounded-2xl overflow-hidden
      bg-gradient-to-b from-zinc-900 to-zinc-950
      border border-white/10 hover:border-indigo-500
      transition-all duration-300 hover:shadow-lg
      ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    {/* IMAGE CONTAINER */}
    <div className="aspect-square bg-zinc-800 flex items-center justify-center p-6">
      <img
        src={gpt.logo}
        alt={gpt.title}
        className="max-h-28 object-contain"
      />
    </div>

    {/* CONTENT */}
    <div className="p-4 flex flex-col h-[130px]">
      <h3 className="text-sm font-semibold text-white line-clamp-2">
        {gpt.title}
      </h3>

      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 flex-1">
        {gpt.description}
      </p>

      <div className="text-xs mt-2 text-zinc-300">
        {locked
          ? "🔒 Limit reached"
          : plan === "free"
          ? `${used} / ${limit} used today`
          : "Unlimited"}
      </div>
    </div>
  </div>
);
}
