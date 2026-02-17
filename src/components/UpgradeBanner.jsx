import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function UpgradeBanner({ show }) {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-3">
      <div className="rounded-lg bg-indigo-600 text-white p-3 flex items-center justify-between">
        <div>
          <strong>{t('upgradeUnlock') || 'Unlock all 50+ GPT apps'}</strong> — {t('upgradeBenefits') || 'higher limits, premium styles.'}
        </div>
        <a href="/premium" className="ml-4 px-3 py-1 rounded bg-black">
          {t('upgrade') || 'Upgrade'}
        </a>
      </div>
    </div>
  );
}