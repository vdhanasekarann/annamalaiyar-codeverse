import React from 'react';
import clsx from 'clsx';

// GlassCard implements the premium glass visual tokens and hover behaviour
export default function GlassCard({ children, className = '', theme = 'gold', ...props }) {
  const themeClass = theme === 'gold' ? 'glass-gold' : theme === 'pink' ? 'glass-pink' : 'glass-dark';

  return (
    <div
      className={clsx('rounded-[22px] transition-all duration-200 transform-gpu will-change-transform z-10', themeClass, className)}
      {...props}
    >
      {children}
    </div>
  );
}
