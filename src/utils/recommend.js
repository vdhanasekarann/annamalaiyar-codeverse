// Lightweight recommendation / predictive sorting prototype
// Uses the user's usage counts and GPT category affinity to score GPTs.

export function recommendSort(gpts = [], usage = {}) {
  // Build category preference from user's usage
  const categoryScore = {};
  for (const gpt of gpts) {
    const u = Number(usage[gpt.id] || 0);
    if (!categoryScore[gpt.category]) categoryScore[gpt.category] = 0;
    categoryScore[gpt.category] += u;
  }

  // Compute a per-GPT score: category preference weight + personal usage + fallback popularity
  // Normalize and return sorted array (desc)
  const maxCategory = Math.max(0, ...Object.values(categoryScore));

  const scored = gpts.map((g) => {
    const personal = Number(usage[g.id] || 0);
    const catPref = categoryScore[g.category] || 0;
    // Score formula (tunable): prefer category affinity, then personal usage, then rating/popularity
    const score = (maxCategory ? catPref / (maxCategory || 1) : 0) * 0.6 + Math.min(personal, 50) / 50 * 0.3;
    return { g, score };
  });

  scored.sort((a, b) => b.score - a.score || a.g.title.localeCompare(b.g.title));
  return scored.map((s) => s.g);
}

export default recommendSort ;