import GPTCard from "./GPTCard";
import { GPTS } from "../data/gpts";
import { useSearch } from "../context/SearchContext";
import { useTheme } from "../context/ThemeContext";

export default function AppGrid({ plan, usage = {}, onUsed, limit, gpts = null }) {
  const { query } = useSearch();
  const { theme } = useTheme();
  const baseList = gpts || (limit ? GPTS.slice(0, limit) : GPTS);

  const filtered = baseList.filter((g) =>
    g.title.toLowerCase().includes((query || "").toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((gpt, i) => (
          <div key={gpt.id} style={{ animationDelay: `${i * 75}ms` }} className="animate-card-enter h-full">
            <GPTCard
              gpt={gpt}
              used={usage[gpt.id] || 0}
              plan={plan}
              onUsed={onUsed}
              theme={theme}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
