import { useMemo } from "react";
import { parseLimit } from "../config/limits";

export default function AppIcon({ gpt, plan = "free", used = 0 }) {
  const isPremium = plan !== "free";
  const freeLimit = useMemo(() => parseLimit(gpt?.freeLimit), [gpt?.freeLimit]);
  const locked = !isPremium && used >= freeLimit;

  return (
    <div
      className={`relative rounded-2xl p-4 text-center bg-white/10 backdrop-blur transition ${
        locked ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
      }`}
    >
      <img src={gpt?.logo} alt={gpt?.title} className="h-12 mx-auto mb-2" />
      <p className="text-sm font-medium">{gpt?.title}</p>

      <div className="mt-2 text-xs">
        {isPremium ? (
          <span className="text-green-300">Unlimited</span>
        ) : locked ? (
          <span className="text-red-300">Locked: limit reached</span>
        ) : (
          <span className="text-green-300">
            {used} / {freeLimit} used today
          </span>
        )}
      </div>
    </div>
  );
}
