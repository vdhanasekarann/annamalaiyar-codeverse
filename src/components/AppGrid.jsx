import GPTCard from "./GPTCard";
import { GPTS } from "../data/gpts";
import { useSearch } from "../context/SearchContext";
import { Navigate, Link } from "react-router-dom";

export default function AppGrid({ plan, usage = {}, onUsed, limit, gpts = null }) {
  const { query } = useSearch();
  const baseList = gpts || (limit ? GPTS.slice(0, limit) : GPTS);
  // theme: if gpts prop provided (recent/dashboard) use gold theme, otherwise pink for global GPTs page
  const theme = gpts ? "gold" : "pink";

  const filtered = baseList.filter((g) =>
    g.title.toLowerCase().includes((query || "").toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((gpt) => (
          <GPTCard
            key={gpt.id}
            gpt={gpt}
            used={usage[gpt.id] || 0}
            plan={plan}
            onUsed={onUsed}
            theme={theme}
          />
        ))}
              plan={plan}
              onUsed={onUsed}
            />
          </div>
        ))}
      </div>
    </div>
  );
}