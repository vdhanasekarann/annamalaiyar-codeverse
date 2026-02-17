import React from 'react';
import clsx from 'clsx';

// A lightweight GlassCard wrapper to enforce the design system tokens
export default function GlassCard({ children, className = '', theme = 'gold', ...props }) {
  return (
    <div
      className={clsx('rounded-3xl transition-all duration-300 transform-gpu', {
        'glass-gold': theme === 'gold',
        'glass-pink': theme === 'pink',
        'glass-dark': theme === 'dark',
      }, className)}
      {...props}
    >
      {children}
    </div>
  );
}
