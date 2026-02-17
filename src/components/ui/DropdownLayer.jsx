import React from 'react';
import { createPortal } from 'react-dom';

export default function DropdownLayer({ children, className = '', style = {} }) {
  if (typeof document === 'undefined') return <div className={className} style={style}>{children}</div>;
  return createPortal(
    <div className={`fixed z-[200] ${className}`} style={style}>
      {children}
    </div>,
    document.body
  );
}
