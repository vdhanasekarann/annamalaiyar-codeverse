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

    await onUsed();

    window.open(gpt.link, "_blank");
  };

  return (
    <div
      onClick={click}
      className={`relative rounded-xl p-4 cursor-pointer
        bg-zinc-900/80 border border-white/10
        transition hover:border-indigo-500
        ${locked ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <img src={gpt.logo} className="h-10 mb-2" />

      <h3 className="text-sm font-semibold truncate">
        {gpt.title}
      </h3>

      <p className="text-xs text-zinc-400 line-clamp-2">
        {gpt.description}
      </p>

      <div className="mt-2 text-xs">
        {locked
          ? "Limit reached"
          : plan === "free"
          ? `${used} / ${limit} used today`
          : "Unlimited"}
      </div>
    </div>
  );
}
