import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiFetch";

export default function GPTDetails() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    apiFetch(`/api/reviews/${id}`)
      .then(r => r.json())
      .then(setReviews);
  }, [id]);

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {reviews.length === 0 && (
        <p className="opacity-60">No reviews yet.</p>
      )}

      <div className="space-y-4">
        {reviews.map((r,i)=>(
          <div key={i} className="bg-zinc-900 p-4 rounded-xl">
            <div className="text-yellow-400">⭐ {r.rating}/5</div>
            <p className="mt-1">{r.review}</p>
            <div className="text-xs opacity-50 mt-2">{r.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
}