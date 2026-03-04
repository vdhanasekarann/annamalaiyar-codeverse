import { useMemo } from "react";
import GlassCard from "./GlassCard";
import { useTheme } from "../context/ThemeContext";
import { useLocation } from "react-router-dom";

const ROTATING_HEADLINES = [
  "One Subscription. Unlimited AI Power.",
  "50+ Premium GPTs. One Price.",
  "World's First Multi-GPT AI Platform.",
  "The Netflix of AI Tools.",
  "All AI Tools. One Upgrade.",
];

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function UpgradeBanner({ show }) {
  const { theme } = useTheme();
  const location = useLocation();
  const rotatingHeadline = useMemo(() => {
    const dayKey = Math.floor(Date.now() / 86400000);
    const key = `${location.pathname || "/"}:${dayKey}`;
    const index = hashString(key) % ROTATING_HEADLINES.length;
    return ROTATING_HEADLINES[index];
  }, [location.pathname]);

  if (!show) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
      <GlassCard theme={theme} className="glass-card-float p-5 sm:p-6 rounded-2xl border border-yellow-400/25">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-yellow-400/45 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
            World's Best AI Upgrade Deal
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight">{rotatingHeadline}</h3>
            <p className="text-zinc-200 mt-2 leading-relaxed">
              Most AI platforms charge <strong>Rs 199/month</strong> for just one GPT. CodeVerse AI OS
              unlocks <strong>50+ Premium GPT tools</strong> with one subscription.
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-black/25 p-4">
            <p className="font-semibold text-yellow-100">Starter Plan - Rs 199 / Month</p>
            <div className="mt-2 space-y-1 text-sm text-zinc-200">
              <p>- Access 50+ Advanced AI GPT Tools</p>
              <p>- Business, Coding, Finance, Education, Content, Design and more</p>
              <p>- Continuous GPT updates and new tools added</p>
              <p>- One subscription unlocks everything</p>
            </div>
          </div>

          <p className="text-sm text-yellow-100/90">
            Why pay Rs 199 for one GPT elsewhere, when CodeVerse AI OS gives 50+ GPTs for the same price?
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/premium"
              className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:opacity-95"
            >
              Upgrade Now
            </a>
            <p className="text-xs text-zinc-300">World's first multi-GPT platform under one subscription.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
