import { parseLimit } from "../config/limits";
import { apiFetch } from "../lib/apiFetch";

export default function GPTCard({ gpt, used, plan }) {
  const limit = plan === "free" ? parseLimit(gpt.freeLimit) : Infinity;
  const locked = plan === "free" && used >= limit;

const click = async () => {
  if (locked) return;

  await apiFetch("/api/usage", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gpt: gpt.id,
    }),
  });

  // REFRESH USAGE AFTER POST
const updated = await apiFetch("/api/usage?email=" + user.email);
setUsage(await updated.json());
  
  window.open(gpt.link, "_blank");
};

  return (
    <div
  onClick={click}
  className={`relative rounded-xl p-4 cursor-pointer
    bg-zinc-900/80 border border-white/10
    transition hover:border-indigo-500 hover:shadow-purple
    ${locked ? "opacity-60 cursor-not-allowed" : ""}
  `}
>
      <div className="w-12 h-12 mb-3 rounded-lg bg-black/40 flex items-center justify-center">
        <img src={gpt.logo} alt={gpt.title} className="w-28 h-18 object-contain" />
      </div>

      <h3 className="text-sm font-semibold text-white truncate">
        {gpt.title}
      </h3>

      <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
        {gpt.description}
      </p>

      <div className="mt-3 text-xs text-zinc-300">
        {locked
          ? "🔒 Limit reached"
          : plan === "free"
          ? `${used} / ${limit} used today`
          : "Unlimited"}
      </div>

      {locked && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-xs">
          Upgrade to unlock
        </div>
      )}
    </div>
  );
}
