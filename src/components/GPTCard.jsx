import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { parseLimit } from "../config/limits";
import { apiFetch } from "../lib/apiFetch";
import GlassCard from "./GlassCard";
import CountUp from "./ui/CountUp";

function GPTCard({ gpt, used, plan, onUsed, theme = "pink" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const limit = plan === "free" ? parseLimit(gpt.freeLimit) : Infinity;
  const locked = plan === "free" && used >= limit;
  const accent = "var(--accent, #facc15)";

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

    const prev = JSON.parse(localStorage.getItem("recentGPTs") || "[]");
    localStorage.setItem(
      "recentGPTs",
      JSON.stringify([gpt.id, ...prev.filter((id) => id !== gpt.id)].slice(0, 4))
    );

    if (onUsed) await onUsed();

    const targetUrl = gpt.link ?? gpt.url ?? `/gpt/${gpt.slug || gpt.id}`;
    try {
      window.open(targetUrl, "_blank");
    } catch {
      navigate(`/gpt/${gpt.slug || gpt.id}`);
    }
  };

  return (
    <GlassCard
      theme={theme}
      className="magnetic gpu p-6 h-full min-h-[540px] flex flex-col relative"
      onClick={(e) => {
        if (e.target.closest("a,button")) return;
        click();
      }}
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[30px] pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
        {theme === "gold" ? (
          <>
            <div className="absolute -top-10 -left-20 w-60 h-40 bg-gradient-to-br from-yellow-400/30 via-amber-400/20 to-transparent opacity-40 blur-2xl rotate-12" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent mix-blend-screen opacity-10" />
          </>
        ) : (
          <>
            <div className="absolute -top-10 -left-20 w-60 h-40 bg-gradient-to-br from-pink-500/30 via-purple-400/18 to-transparent opacity-40 blur-2xl rotate-12" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/2 to-transparent mix-blend-screen opacity-6" />
          </>
        )}
      </div>

      <div className="flex items-center justify-center mt-2 relative z-10">
        <div className="w-36 h-36 flex items-center justify-center rounded-xl overflow-hidden relative">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-lg skeleton" />
            </div>
          )}
          <img
            src={gpt.logo}
            alt={gpt.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            className="w-32 h-32 object-contain mx-auto"
          />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 relative z-10">
        <h3 className="text-lg font-bold tracking-wide gpt-title text-white line-clamp-2">
          {t(gpt.title) || gpt.title}
        </h3>

        <p className="text-sm mt-2 text-zinc-300 line-clamp-6">
          {t(gpt.description) || gpt.description}
        </p>

        <div className="mt-3 h-5 text-sm text-yellow-400">
          {avg ? (
            <>
              <span className="rating-pulse">{"\u2B50 "}</span>
              <CountUp value={avg} /> ({reviews.length})
            </>
          ) : (
            t("noRatings") || "No ratings"
          )}
        </div>

        <div className="mt-2 h-5 text-xs text-zinc-400">
          {reviews.length > 0
            ? t("reviewCount", { count: reviews.length }) || `${reviews.length} review(s)`
            : t("noReviewsYet") || "No reviews yet"}
        </div>

        <div className="mt-auto pt-3 grid grid-cols-2 gap-2 items-stretch">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/gpt/${gpt.id}`);
            }}
            className="w-full min-w-0 px-2 py-2 text-xs font-semibold leading-tight text-center rounded-md bg-black/45 border border-white/15 text-white hover:bg-black/60 transition-colors whitespace-normal break-words"
            style={{ boxShadow: `0 0 0 1px ${accent}25 inset` }}
          >
            {t("writeReview") || "Write Review"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/reviews/${gpt.id}`);
            }}
            className="w-full min-w-0 px-2 py-2 text-xs font-semibold leading-tight text-center rounded-md text-black transition-colors whitespace-normal break-words"
            style={{ backgroundColor: accent }}
            aria-label={t("viewReviews") || "View Reviews"}
          >
            {t("viewReviews") || "View Reviews"}
          </button>
        </div>

        <div className="text-sm mt-3 text-zinc-300">
          {locked
            ? `${t("locked") || "Limit reached"}`
            : plan === "free"
              ? `${used} / ${limit} ${t("usedToday") || "used today"}`
              : t("unlimited") || "Unlimited"}
        </div>
      </div>
    </GlassCard>
  );
}

export default React.memo(GPTCard);
