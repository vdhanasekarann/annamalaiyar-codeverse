import React from 'react';
import GlassCard from "./GlassCard";
import { useTheme } from "../context/ThemeContext";

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
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((s, i) => (
        <CountStat
          key={s.key || i}
          label={s.label}
          value={s.value}
          duration={900 + i * 100}
          theme={theme}
          delay={i * 120}
        />
      ))}
    </div>
  );
}

function CountStat({ label, value, duration, theme, delay = 0 }) {
  const val = useCountUp(value, duration);
  return (
    <GlassCard
      theme={theme}
      className="glass-card-float p-4 rounded-xl min-h-[120px]"
      style={{ "--float-delay": `${delay}ms` }}
    >
      <div className="text-sm text-zinc-300">{label}</div>
      <div className="text-2xl font-bold text-white mt-2">{val}</div>
    </GlassCard>
  );
}
