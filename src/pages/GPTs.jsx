import { GPTS } from "../data/gpts";
import LazyGPTCard from "../components/LazyGPTCard";
import { recommendSort } from "../utils/recommend";
import { useUsage } from "../hooks/useUsage";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { useTheme } from "../context/ThemeContext";

export default function GPTsPage() {
  const { user } = useAuth();
  const [active,setActive]=useState("All");
  const { query, setQuery } = useSearch();
  const location = useLocation();
  const { usage, refresh } = useUsage(user?.email);
  const { theme } = useTheme();
    
  const baseFiltered = GPTS.filter((g) =>
    g.title.toLowerCase().includes((query || "").toLowerCase()) &&
    (active === "All" || g.category === active || active === 'Recommended')
  );

  const filtered = active === 'Recommended'
 ? recommendSort(baseFiltered, usage)
 : baseFiltered;

  // Sync query param to global search context so direct links work
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setQuery(q);
  }, [location.search, setQuery]);

  const categories = [...new Set(GPTS.map(g => g.category))];

  const { t } = useTranslation();

  if (!user) return <div>{t('loading') || 'Loading...'}</div>;

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {["Recommended", "All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-3 py-1 rounded-full border ${active === c ? "bg-indigo-600" : "bg-zinc-800"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {(filtered || []).map((gpt) => (
          <div key={gpt.id} className="h-full">
            <LazyGPTCard
              gpt={gpt}
              used={usage[gpt.id] || 0}
              plan={user.plan}
              onUsed={refresh}
              theme={theme}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
