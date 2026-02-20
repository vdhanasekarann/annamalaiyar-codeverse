import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../lib/apiFetch";
import { useAuth } from "../context/AuthContext";

export default function GPTDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const accent = "var(--accent, #4f46e5)";

  const loadReviews = async () => {
    const res = await apiFetch(`/api/reviews/${id}`);
    const data = res.ok ? await res.json() : [];
    setReviews(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  const submit = async () => {
    if (!text.trim() || !user?.email) return;

    const res = await apiFetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gpt: id,
        rating,
        review: text.trim(),
        email: user.email,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to submit review");
      return;
    }

    setText("");
    loadReviews();
  };

  const avg = useMemo(() => {
    if (reviews.length === 0) return null;
    return (
      reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  return (
    <div className="p-3 sm:p-6 text-white max-w-3xl mx-auto">
      <div className="glass-panel p-5 sm:p-6 border border-white/10">
        <h1 className="text-2xl font-semibold mb-4">{t("reviews") || "Reviews"}</h1>

        {avg && (
          <div className="mb-4 text-yellow-400 font-semibold">
            {`⭐ ${avg} (${reviews.length})`}
          </div>
        )}

        <div className="mb-6 space-y-3 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-4 sm:p-5">
          <label className="text-sm font-medium block">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full sm:w-auto bg-black/50 border border-white/20 text-white px-3 py-2 rounded"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <label className="text-sm font-medium block">{t("writeReview") || "Write Review"}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-32 p-3 text-white rounded-xl bg-black/45 border border-white/20 placeholder:text-zinc-400 focus:outline-none focus:ring-2"
            style={{ boxShadow: `inset 0 0 0 1px ${accent}33` }}
            placeholder={t("writeReview") || "Write Review"}
          />

          <button
            onClick={submit}
            className="px-4 py-2 rounded-md font-semibold text-black"
            style={{ backgroundColor: accent }}
          >
            {t("submitReview") || "Submit Review"}
          </button>
        </div>

        <div className="space-y-3">
          {reviews.map((r, idx) => (
            <div
              key={`${r.id || r.email || "anon"}-${idx}`}
              className="bg-black/35 border border-white/10 p-4 rounded-xl"
            >
              <div className="text-yellow-400 font-semibold">{`⭐ ${r.rating}`}</div>
              <p className="whitespace-pre-wrap text-zinc-200 mt-1">{r.review}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
