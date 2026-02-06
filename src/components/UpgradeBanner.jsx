import { useEffect, useState } from "react";

export default function UpgradeBanner({ show }) {
  if (!show) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-3">
      <div className="rounded-lg bg-indigo-600 text-white p-3 flex items-center justify-between">
        <div>
          <strong>Unlock all 40 GPT apps</strong> — higher limits, premium styles.
        </div>
        <a href="/premium" className="ml-4 px-3 py-1 rounded bg-black">
          Upgrade
        </a>
      </div>
    </div>
  );
}