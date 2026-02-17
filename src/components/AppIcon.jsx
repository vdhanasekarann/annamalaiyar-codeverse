"use client";
import { useEffect, useState } from "react";

export default function AppIcon({ gpt, plan }) {
  const [used, setUsed] = useState(0);

  const userEmail = "test@user.com"; // later from auth
  const isPremium = plan !== "free";

  const freeLimit = parseInt(gpt.freeLimit); // "5 images/day" → 5
  const locked = !isPremium && used >= freeLimit;

  useEffect(() => {
    async function fetchUsage() {
      const res = await fetch(
        `/api/usage?email=${userEmail}&gpt=${gpt.id}`
      );
      const data = await res.json();
      setUsed(data.count || 0);
    }

    fetchUsage();
  }, []);

  return (
    <div
      className={`relative rounded-2xl p-4 text-center
      bg-white/10 backdrop-blur transition
      ${locked ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
      onClick={() => {
        if (!locked) window.open(gpt.link, "_blank");
      }}
    >
      <img src={gpt.logo} className="h-12 mx-auto mb-2" />
      <p className="text-sm font-medium">{gpt.title}</p>

      <div className="mt-2 text-xs">
        {isPremium ? (
          <span className="text-green-300">Unlimited</span>
        <div className="p-2 rounded-md glass-clear transition">
          <span className="text-red-300">🔒 Limit reached</span>
        ) : (
          <span className="text-green-300">
            {used} / {freeLimit} used today
          </span>
        )}
      </div>
    </div>
  );
}
