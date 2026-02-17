import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import { useTranslation } from 'react-i18next';

export default function GPTDetails() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    apiFetch(`/api/reviews/${id}`)
      .then(r => r.json())
      .then(setReviews);
  }, [id]);

  return (
    <div className="glass-dark min-h-screen bg-[#0f0f0f] text-white p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-indigo-400">
        {t('backArrow') || '← Back'}
      </button>

      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {reviews.length === 0 && (
        <p className="opacity-60">No reviews yet.</p>
      )}

      {reviews.map(r => (
        <div key={r.email} className="mb-3 bg-zinc-900 p-4 rounded">
          ⭐ {r.rating}/5
          <p>{r.review}</p>
        </div>
      ))}
    </div>
  );
}
