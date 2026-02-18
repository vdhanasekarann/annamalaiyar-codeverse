import { parseLimit } from "../config/limits";
import { apiFetch } from "../lib/apiFetch";
import React from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from 'clsx';
import GlassCard from './GlassCard';

function GPTCard({ gpt, used, plan, onUsed, theme = 'pink' }) {
  const { t } = useTranslation();
  const limit = plan === "free" ? parseLimit(gpt.freeLimit) : Infinity;
  const locked = plan === "free" && used >= limit;
  const navigate = useNavigate();

  const [reviews, setReviews] = React.useState([]);
  const [imgLoaded, setImgLoaded] = React.useState(false);

  const avg = React.useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);
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
    // Primary navigation opens the actual GPT app URL in a new tab if provided
    const targetUrl = gpt.link ?? gpt.url ?? `/gpt/${gpt.slug || gpt.id}`;
    try {
      window.open(targetUrl, "_blank");
    } catch (e) {
      // fallback to client-side navigation
      navigate(`/gpt/${gpt.slug || gpt.id}`);
    }
  };

  // Apply explicit glass token classes per page theme (gold for dashboard, pink for GPTs page)
  const glassBase =
 "rounded-3xl backdrop-blur-xl border transition duration-300 relative overflow-hidden cursor-pointer";

const cardClasses = `${glassBase} hover:scale-[1.03] p-6`;

  return (
    <GlassCard
      theme={theme}
      className={cardClasses}
      onClick={(e) => { if (e.target && e.target.closest && e.target.closest('a,button')) return; click(); }}
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
      <div className="flex items-center justify-center mt-2">
        <div className="w-20 h-20 md:w-20 md:h-20 flex items-center justify-center rounded-xl overflow-hidden relative">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-lg skeleton" />
            </div>
          )}
          <img src={gpt.logo} alt={gpt.title} loading="lazy" onLoad={() => setImgLoaded(true)} onError={() => setImgLoaded(true)} className="w-20 h-20 object-contain mx-auto" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col min-h-[140px]">
        <h3 className={`text-base font-semibold gpt-title line-clamp-2 ${theme==='gold'?'text-yellow-300':'text-white'}`}>{t(gpt.title) || gpt.title}</h3>

        <p className={`text-sm mt-2 line-clamp-4 ${theme==='gold'?'text-zinc-200':'text-zinc-200/80'}`}>{t(gpt.description) || gpt.description}</p>
          ⭐ <CountUp value={avg}/>
        {avg && (
          <div className="text-xs text-yellow-400 mt-1">
            <span className="rating-pulse">⭐ {avg}</span> ({reviews.length})
          </div>
        )}

        <div className="mt-6 space-y-3">
          {reviews.map((r, i) => (
            <div key={r.id || `${gpt.id}-${i}`} className="bg-zinc-900 p-3 rounded">
              ⭐ {r.rating}/5
              <p className="text-sm opacity-80">{r.review}</p>
            </div>
          ))}
        </div>

        <button
 onClick={(e)=>{
   e.stopPropagation();
   navigate(`/reviews/${gpt.id}`);
 }}
            className={`text-xs mt-2 underline ${theme==='gold'?'text-yellow-400':'text-indigo-400'}`}
            aria-label={t('viewReviews') || 'View Reviews'}
          >
            {t("viewReviews") || "View Reviews"}
          </button>

        <div className="text-xs mt-2 text-zinc-300">
          {locked
            ? `${t("locked") || "🔒 Limit reached"}`
            : plan === "free"
            ? `${used} / ${limit} ${t("usedToday") || "used today"}`
            : t("unlimited") || "Unlimited"}
        </div>
      </div>
    </GlassCard>
  );
}

export default React.memo(GPTCard);