import GPTCard from "./GPTCard";
import { GPTS } from "../data/gpts";

export default function AppGrid({ plan, usage = {} }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {GPTS.map((gpt, index) => (
          <GPTCard
            key={`${gpt.id}-${index}`}
            gpt={gpt}
            used={usage[gpt.id] || 0}
            plan={plan}
          />
        ))}
      </div>
    </div>
  );
}
