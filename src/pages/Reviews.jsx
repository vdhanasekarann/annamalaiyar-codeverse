import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/apiFetch';

export default function ReviewsPage(){
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      try{
        const res = await apiFetch(`/api/reviews/${id}`);
        const data = res.ok ? await res.json() : [];
        if(!mounted) return;
        setReviews(data || []);
      }catch(e){
        if(mounted) setReviews([]);
      }finally{ if(mounted) setLoading(false); }
    }
    load();
    return ()=>{ mounted = false; };
  },[id]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
      <Link to="/gpts" className="text-sm text-indigo-400 underline mb-4 inline-block">← Back to GPTs</Link>
      {loading ? <div>Loading…</div> : (
        <div className="space-y-4">
          {reviews.length===0 && <div className="text-sm opacity-60">No reviews found.</div>}
          {reviews.map(r=> (
            <div key={r.id} className="p-4 rounded-lg bg-zinc-900/40">
              <div className="font-semibold">{r.author || 'Anonymous'} — {r.rating}/5</div>
              <p className="text-sm opacity-80 mt-2">{r.review}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
