import React from 'react';
import clsx from 'clsx';

// GlassCard implements the premium glass visual tokens and hover behaviour
export default function GlassCard({ children, className = '', theme = 'gold', ...props }) {
  const themeClass = theme === 'gold' ? 'glass-card--gold' : theme === 'pink' ? 'glass-card--pink' : 'glass-card--dark';

  return (
    <div
      className={clsx('glass-card transition-all duration-200 transform-gpu will-change-transform z-10', themeClass, className)}
      {...props}
    >
      {children}
    </div>
  );
}
