import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../lib/apiFetch";

export default function ReviewsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await apiFetch(`/api/reviews/${id}`);
        const data = res.ok ? await res.json() : [];
        if (!mounted) return;
        setReviews(data || []);
      } catch {
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      <div className="glass-panel p-5 sm:p-6 border border-white/10">
        <h2 className="text-2xl font-semibold mb-2">{t("reviews") || "Reviews"}</h2>
        <Link to="/gpts" className="text-sm text-indigo-300 underline mb-4 inline-block">
          {"← " + (t("backToGpts") || "Back to GPTs")}
        </Link>

        {loading ? (
          <div>{t("loading") || "Loading..."}</div>
        ) : (
          <div className="space-y-4">
            {reviews.length === 0 && (
              <div className="text-sm opacity-70">
                {t("reviewsFound") || "No reviews found."}
              </div>
            )}
            {reviews.map((r, idx) => (
              <div
                key={`${r.id || r.email || "anon"}-${idx}`}
                className="p-4 rounded-lg bg-black/35 border border-white/10"
              >
                <div className="font-semibold">
                  {(r.author || r.email || t("unknownUser") || "Anonymous") + " — "}
                  {`${r.rating}/5`}
                </div>
                <p className="text-sm opacity-90 mt-2 whitespace-pre-wrap">{r.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
