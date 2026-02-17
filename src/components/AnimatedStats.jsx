import React from 'react';

function useCountUp(target, duration = 1000) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let start = null;
    let rafId;
    const from = 0;
    const to = Number(target) || 0;
    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(1, elapsed / duration);
      setValue(Math.floor(from + (to - from) * progress));
      if (progress < 1) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return value;
}

export default function AnimatedStats({ stats = [] }){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((s, i) => {
        const val = useCountUp(s.value, 900 + i * 100);
        return (
          <div key={s.key||i} className="p-4 rounded-xl glass-gold">
            <div className="text-sm text-zinc-300">{s.label}</div>
            <div className="text-2xl font-bold text-white mt-2">{val}</div>
          </div>
        )
      })}
    </div>
  )
}
