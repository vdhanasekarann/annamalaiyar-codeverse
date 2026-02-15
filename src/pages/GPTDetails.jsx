import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiFetch";

export default function GPTDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    apiFetch(`/api/reviews/${id}`)
      .then(r => r.json())
      .then(setReviews);
  }, [id]);

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <button
        onClick={()=>navigate(-1)}
        className="mb-4 text-indigo-400"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {reviews.length === 0 && (
        <p className="opacity-60">No reviews yet.</p>
      )}

      {reviews.map(r=>(
        <div key={r.id} className="bg-zinc-900 p-4 rounded-xl mb-3">
          ⭐ {r.rating}/5
          <p>{r.review}</p>
        </div>
      ))}
    </div>
  );
}
