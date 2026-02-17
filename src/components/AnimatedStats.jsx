import React from 'react';

export default function AnimatedStats({ stats = [] }){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((s, i) => (
        <div key={s.key||i} className="p-4 rounded-xl bg-gradient-to-br from-black/40 to-black/20 border border-yellow-600/10">
          <div className="text-sm text-zinc-300">{s.label}</div>
          <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
        </div>
      ))}
    </div>
  )
}
