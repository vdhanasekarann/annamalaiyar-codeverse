import { GPTS } from "../data/gpts";
import GPTCard from "../components/GPTCard";
import { useUsage } from "../hooks/useUsage";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiFetch";
import { Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";

export default function GPTsPage() {
  const { user, setUser } = useAuth();
  const [active,setActive]=useState("All");
  const navigate = useNavigate();
  const { query, setQuery } = useSearch();
  const location = useLocation();

  const filtered = GPTS.filter((g) =>
    g.title.toLowerCase().includes((query || "").toLowerCase())
  );

  useEffect(() => {
    if (!user) return;
    apiFetch("/api/user")
      .then((r) => r.json())
      .then(setUser);
  }, [user, setUser]);

  // Sync query param to global search context so direct links work
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setQuery(q);
  }, [location.search, setQuery]);

  const { usage, refresh } = useUsage(user?.email);
  const categories = [...new Set(GPTS.map(g => g.category))];

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
 {["All",...categories].map(c=>(
  <button
   key={c}
   onClick={()=>setActive(c)}
   className={`px-3 py-1 rounded-full border
     ${active===c?"bg-indigo-600":"bg-zinc-800"}`}
  >
   {c}
  </button>
 ))}
  
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((gpt) => (
        <GPTCard
          key={gpt.id}
          gpt={gpt}
          used={usage[gpt.id] || 0}
          plan={user.plan}
          onUsed={refresh}
        />
      ))}
    </div>
    </div>);
}
