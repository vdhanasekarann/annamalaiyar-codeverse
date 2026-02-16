import { parseLimit } from "../config/limits";
import { apiFetch } from "../lib/apiFetch";
import React from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function GPTCard({ gpt, used, plan, onUsed }) {
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
      className="relative rounded-3xl p-6 transform-gpu will-change-transform perspective-1000 hover:scale-105 transition-all duration-300"
      style={{
        boxShadow: "0 20px 40px rgba(2,6,23,0.6)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(15,11,30,0.25))",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute -top-10 -left-20 w-60 h-40 bg-gradient-to-br from-pink-500/30 via-indigo-400/20 to-transparent opacity-40 blur-2xl transform rotate-12"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/2 to-transparent mix-blend-screen opacity-6"></div>
      </div>
      {/* IMAGE CONTAINER */}
      <div className="h-44 md:h-52 rounded-xl overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900/10 via-purple-800/10 to-transparent border border-white/3">
        <div className="w-full h-full flex items-center justify-center">
          <img src={gpt.logo} alt={gpt.title} loading="lazy" className="max-h-28 max-w-28 object-contain rounded-md bg-white/6 p-2" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col min-h-[140px]">
        <h3 className="text-sm font-semibold text-white line-clamp-2 drop-shadow-md">{t(gpt.title) || gpt.title}</h3>

        <p className="text-sm text-zinc-300 mt-2 line-clamp-3">{t(gpt.description) || gpt.description}</p>

        <div className="mt-6 space-y-3">
          {reviews.map((r, i) => (
            <div key={r.id || `${gpt.id}-${i}`} className="bg-zinc-900 p-3 rounded">
              ⭐ {r.rating}/5
              <p className="text-sm opacity-80">{r.review}</p>
            </div>
          ))}
        </div>

        <Link to={`/gpt/${gpt.id}`} className="text-xs text-indigo-400 mt-2">
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