import { GPTS } from "../data/gpts";
import GPTCard from "../components/GPTCard";
import { useUsage } from "../hooks/useUsage";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiFetch";
import { Link } from "react-router-dom";

export default function GPTsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(r => r.json())
      .then(setUser);
  }, []);

  navigate(`/gpts?q=${query}`)

  const { usage, refresh } = useUsage(user?.email);
  const categories = [...new Set(GPTS.map(g => g.category))];

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {GPTS.map((gpt) => (
        <GPTCard
          key={gpt.id}
          gpt={gpt}
          used={usage[gpt.id] || 0}
          plan={user.plan}
          onUsed={refresh}
        />
      ))}
    </div>
  );
}
