import React from 'react';

export default function BackdropOverlay({ onClick }) {
  return (
    <div className="fixed inset-0 z-[900] bg-black/40 backdrop-blur-sm" onClick={onClick} />
  );
}
