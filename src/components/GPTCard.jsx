import { parseLimit } from "../config/limits";
import { apiFetch } from "../lib/apiFetch";
import React from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from 'clsx';

function GPTCard({ gpt, used, plan, onUsed, theme = 'pink' }) {
  const { t } = useTranslation();
  const limit = plan === "free" ? parseLimit(gpt.freeLimit) : Infinity;
  const locked = plan === "free" && used >= limit;
  const navigate = useNavigate();

  const [reviews, setReviews] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    apiFetch(`/api/reviews/${gpt.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!mounted) return;
        setReviews(data || []);
      })
      .catch(() => {
        if (mounted) setReviews([]);
      });
    return () => {
      mounted = false;
    };
  }, [gpt.id]);

  const click = async () => {
    if (locked) return;

    await apiFetch("/api/usage", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gpt: gpt.id }),
    });

    // SAVE RECENT
    const prev = JSON.parse(localStorage.getItem("recentGPTs") || "[]");
    localStorage.setItem(
      "recentGPTs",
      JSON.stringify([gpt.id, ...prev.filter((id) => id !== gpt.id)].slice(0, 4))
    );

    if (onUsed) await onUsed();
    navigate(`/gpt/${gpt.id}`);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target.tagName === "A") return;
        click();
      }}
      className={clsx("relative p-6 transform-gpu will-change-transform perspective-1000 rounded-3xl overflow-hidden transition-transform duration-300", {
        'glass-gold bg-black/30 border border-yellow-400/20 shadow-[0_0_30px_rgba(255,215,0,0.15)] hover:scale-102 hover:shadow-[0_0_50px_rgba(255,215,0,0.25)]': theme === 'gold',
        'glass-pink bg-pink-500/10 border border-pink-400/30 shadow-[0_0_30px_rgba(236,72,153,0.25)] hover:scale-102': theme === 'pink'
      })}
      style={{ minHeight: 280 }}
    >
      <div className="gpt-badge">{gpt.category || 'GPT'}</div>
      <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
          {theme === 'gold' ? (
            <>
              <div className="absolute -top-10 -left-20 w-60 h-40 bg-gradient-to-br from-yellow-400/30 via-amber-400/20 to-transparent opacity-40 blur-2xl transform rotate-12"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent mix-blend-screen opacity-10"></div>
            </>
          ) : (
            <>
              <div className="absolute -top-10 -left-20 w-60 h-40 bg-gradient-to-br from-pink-500/30 via-purple-400/18 to-transparent opacity-40 blur-2xl transform rotate-12"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/2 to-transparent mix-blend-screen opacity-6"></div>
            </>
          )}
        </div>
      {/* IMAGE CONTAINER */}
      <div className={`aspect-square md:aspect-[3/2] rounded-xl overflow-hidden flex items-center justify-center p-4 ${theme==='gold' ? 'bg-black/30 border-yellow-400/10' : 'bg-pink-500/10 border-pink-400/30'}`}>
        <div className="w-full h-full flex items-center justify-center">
          <img src={gpt.logo} alt={gpt.title} loading="lazy" className="object-contain max-h-full max-w-full" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col min-h-[140px]">
        <h3 className={`text-sm font-semibold gpt-title line-clamp-2 drop-shadow-md ${theme==='gold'?'text-yellow-300':'text-white'}`}>{t(gpt.title) || gpt.title}</h3>

        <p className={`text-sm mt-2 line-clamp-4 ${theme==='gold'?'text-zinc-200':'text-zinc-200/80'}`}>{t(gpt.description) || gpt.description}</p>

        <div className="mt-6 space-y-3">
          {reviews.map((r, i) => (
            <div key={r.id || `${gpt.id}-${i}`} className="bg-zinc-900 p-3 rounded">
              ⭐ {r.rating}/5
              <p className="text-sm opacity-80">{r.review}</p>
            </div>
          ))}
        </div>

        <Link to={`/gpt/${gpt.id}`} className={`text-xs mt-2 ${theme==='gold'?'text-yellow-400':'text-indigo-400'}`}>
          {t("viewReviews") || "View Reviews"}
        </Link>

        <div className="text-xs mt-2 text-zinc-300">
          {locked
            ? `${t("locked") || "🔒 Limit reached"}`
            : plan === "free"
            ? `${used} / ${limit} ${t("usedToday") || "used today"}`
            : t("unlimited") || "Unlimited"}
        </div>
      </div>
    </div>
  );
}

export default React.memo(GPTCard);