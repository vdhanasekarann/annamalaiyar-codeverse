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

const [reviews,setReviews] = React.useState([]);
const avg =
reviews.length
? (reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1)
: null;

  React.useEffect(()=>{
    apiFetch(`/api/reviews/${gpt.id}`)
      .then(r=>r.json())
      .then(setReviews);
  },[gpt.id]);

function handleSearch(q){
  navigate(`/gpts?q=${q}`);
}

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
    JSON.stringify([gpt.id, ...prev.filter(id => id !== gpt.id)].slice(0,4))
  );

  if (onUsed) await onUsed();
  // navigate to internal GPT detail page (was opening external link)
  navigate(`/gpt/${gpt.id}`);
};

  return (
  <div
    onClick={(e)=>{
 if(e.target.tagName==="A") return;
 click();
}}
    className="relative rounded-2xl p-6
      backdrop-blur-xl
      bg-white/5
      border border-white/10
      hover:border-indigo-500
      hover:scale-105
      active:scale-95
      transition-all duration-300">
    {/* IMAGE CONTAINER */}
    <div className="h-36 md:h-44 bg-zinc-800 overflow-hidden">
  <img
    src={gpt.logo}
    alt={gpt.title}
    loading="lazy"
    className="w-full h-full object-cover"
  />
</div>

    {/* CONTENT */}
    <div className="p-4 flex flex-col min-h-[120px]">
      <h3 className="text-sm font-semibold text-white line-clamp-2">
        {t(gpt.title) || gpt.title}
      </h3>

      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 md:line-clamp-3">
        {t(gpt.description) || gpt.description}
      </p>
      
      <div className="mt-6 space-y-3">
      {reviews.map((r,i)=>(
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