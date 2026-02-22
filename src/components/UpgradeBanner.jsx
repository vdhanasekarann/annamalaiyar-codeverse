import { useTranslation } from "react-i18next";
import GlassCard from "./GlassCard";
import { useTheme } from "../context/ThemeContext";

export default function UpgradeBanner({ show }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (!show) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-3">
      <GlassCard theme={theme} className="glass-card-float p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <strong>{t("upgradeUnlock") || "Unlock all 50+ GPT apps"}</strong>
            {" - "}
            {t("upgradeBenefits") || "higher limits, premium styles."}
          </div>
          <a
            href="/premium"
            className="self-start sm:self-auto px-3 py-1 rounded bg-black/60 border border-white/15"
          >
            {t("upgrade") || "Upgrade"}
          </a>
        </div>
      </GlassCard>
    </div>
  );
}
