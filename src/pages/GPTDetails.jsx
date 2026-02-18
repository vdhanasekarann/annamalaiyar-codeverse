import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import { useAuth } from "../context/AuthContext";

export default function GPTDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  useEffect(() => {
    loadReviews();
  }, [id]);

  const loadReviews = async () => {
    const r = await apiFetch(`/api/reviews/${id}`);
    setReviews(await r.json());
  };

  const submit = async () => {
    if (!text) return;

    await apiFetch(`/api/reviews/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating,
        review: text,
        email: user.email,
      }),
    });

    setText("");
    loadReviews();
  };

  const avg =
    reviews.length > 0
      ? (
          reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h1 className="text-xl mb-4">Reviews</h1>

      {avg && (
        <div className="mb-4 text-yellow-400">
          ⭐ {avg} ({reviews.length})
        </div>
      )}

      <div className="mb-6 space-y-3">
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="text-black p-2 rounded"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 text-black rounded"
          placeholder="Write review..."
        />

        <button
          onClick={submit}
          className="bg-indigo-600 px-4 py-2 rounded"
        >
          Submit Review
        </button>
      </div>

      {reviews.map((r) => (
        <div key={r.id} className="mb-3 bg-zinc-900 p-4 rounded">
          ⭐ {r.rating}
          <p>{r.review}</p>
        </div>
      ))}
    </div>
  );
}
