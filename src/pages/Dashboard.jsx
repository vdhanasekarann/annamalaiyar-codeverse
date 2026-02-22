import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import AppGrid from "../components/AppGrid";
import UpgradeBanner from "../components/UpgradeBanner";
import GlassCard from "../components/GlassCard";
import { parseLimit } from "../config/limits";
import { GPTS } from "../data/gpts";
import { getDeviceId } from "../utils/device";
import { apiFetch } from "../lib/apiFetch";
import { useUsage } from "../hooks/useUsage";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import AnimatedStats from "../components/AnimatedStats";
import { clearBackground, saveBackground } from "../utils/backgroundStorage";
import { useTheme } from "../context/ThemeContext";

const EXTERNAL_TOOLS = [
  ["ChatGPT", "https://chat.openai.com"],
  ["Claude", "https://claude.ai"],
  ["Gemini", "https://gemini.google.com"],
  ["Copilot", "https://copilot.microsoft.com"],
  ["Sarvam AI", "https://sarvam.ai"],
  ["Grok", "https://grok.com"],
  ["CooklyHub", "https://cooklyhub.com"],
  ["Perplexity AI", "https://www.perplexity.ai"],
  ["Meta AI", "https://www.meta.ai"],
  ["CrewAI", "https://www.crewai.com"],
  ["Jasper AI", "https://www.jasper.ai"],
  ["CA-sentinel", "https://ca.kannizconites.com"],
];

const GPT_BY_ID = Object.fromEntries(GPTS.map((g) => [g.id, g]));
const CATEGORIES = [...new Set(GPTS.map((g) => g.category))];

function buildInsights(usage) {
  const usageRows = Object.entries(usage || {}).filter(([, count]) => Number(count) > 0);
  if (usageRows.length === 0) {
    return {
      heading: "No usage yet",
      lines: [
        "Start with one GPT from Education or Productivity to get personalized insights.",
      ],
      score: 0,
    };
  }

  const total = usageRows.reduce((sum, [, count]) => sum + Number(count || 0), 0);
  const [topGptId, topGptCount] = usageRows.reduce((best, row) =>
    Number(row[1]) > Number(best[1]) ? row : best
  );
  const topGpt = GPT_BY_ID[topGptId];

  const categoryTotals = {};
  usageRows.forEach(([gptId, count]) => {
    const category = GPT_BY_ID[gptId]?.category || "Other";
    categoryTotals[category] = (categoryTotals[category] || 0) + Number(count || 0);
  });

  const [topCategory = "Other", topCategoryCount = 0] = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0] || [];

  const usedCategorySet = new Set(Object.keys(categoryTotals));
  const missingCategory = CATEGORIES.find((category) => !usedCategorySet.has(category));
  const focusPct = Math.round((Number(topCategoryCount) / total) * 100);
  const diversityScore = Math.min(
    100,
    Math.round((usedCategorySet.size / Math.max(CATEGORIES.length, 1)) * 100)
  );

  const lines = [
    `Top GPT: ${topGpt?.title || topGptId} (${topGptCount} uses today)`,
    `Top category: ${topCategory} (${focusPct}% of today's usage)`,
  ];

  if (missingCategory) {
    lines.push(`Try one ${missingCategory} app today to improve usage diversity.`);
  } else {
    lines.push("Great spread across categories. Keep balancing your usage pattern.");
  }

  return {
    heading: "Usage intelligence",
    lines,
    score: diversityScore,
  };
}

function formatLastSeen(value, fallback) {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleString();
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const { usage, refresh } = useUsage(user?.email);
  const { t } = useTranslation();

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("recentGPTs") || "[]");
    setRecent(GPTS.filter((g) => ids.includes(g.id)));
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDevices() {
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await apiFetch("/api/account/devices");
        const devicesData = res.ok ? await res.json() : [];
        if (!mounted) return;
        setDevices(devicesData);

        const deviceId = getDeviceId();
        const exists = devicesData.some((d) => d.device_id === deviceId);
        if (!exists) {
          await apiFetch("/api/account/devices/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceId }),
            credentials: "include",
          });
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDevices();
    return () => {
      mounted = false;
    };
  }, [user]);

  const revokeDevice = async (deviceId) => {
    await apiFetch("/api/account/devices/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
      credentials: "include",
    });

    setDevices((prev) => prev.filter((d) => d.device_id !== deviceId));
  };

  const hasAnyLimitHit =
    user?.plan === "free" &&
    GPTS.some((g) => (usage[g.id] || 0) >= parseLimit(g.freeLimit));

  const sampleStats = useMemo(
    () => [
      { key: "active", label: t("activeDevices") || "Active Devices", value: devices.length || 0 },
      { key: "gpts", label: t("gptApps") || "GPT Apps", value: GPTS.length },
      {
        key: "usage",
        label: t("usage") || "Usage",
        value: Object.values(usage || {}).reduce((a, b) => a + Number(b || 0), 0),
      },
    ],
    [devices.length, t, usage]
  );

  const insight = useMemo(() => buildInsights(usage), [usage]);

  if (authLoading || loading) {
    return <div className="text-white p-6">{t("loading") || "Loading..."}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 z-40">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-200 bg-zinc-800/60 px-3 py-2 rounded cursor-pointer">
            {t("changeBg") || "Change Background"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                try {
                  await saveBackground(user.email, f);
                  localStorage.removeItem(`bg_${user.email}`);
                  window.dispatchEvent(new Event("bgChange"));
                } catch (err) {
                  console.error("Background upload failed:", err);
                }
              }}
            />
          </label>
          <button
            onClick={async () => {
              try {
                await clearBackground(user.email);
              } catch (err) {
                console.error("Background clear failed:", err);
              }
              localStorage.removeItem(`bg_${user.email}`);
              window.dispatchEvent(new Event("bgChange"));
            }}
            className="text-xs text-zinc-200 bg-zinc-800/40 px-3 py-2 rounded"
          >
            {t("clearBg") || "Clear Background"}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            className="px-4 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 shadow z-40"
          >
            {(t("aiTools") || "AI Tools") + " v"}
          </button>
          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-44 glass-panel z-40"
              onClick={(e) => e.stopPropagation()}
            >
              {EXTERNAL_TOOLS.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-4 py-2 hover:bg-indigo-600 rounded-lg"
                >
                  {name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <GlassCard theme={theme} className="glass-card-float p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-3xl font-bold mb-1 break-words">
              {(t("welcome") || "Welcome") + ", "}
              <span className="truncate">{user.email.split("@")[0]}</span>
            </h1>
            <p className="opacity-90 max-w-xl">
              {t("welcomeSubtitle") || "Your AI workspace dashboard"}
            </p>
          </div>
        </div>
      </GlassCard>

      <h2 className="text-lg font-semibold mt-2 mb-4">{t("activeDevices") || "Active Devices"}</h2>

      <div className="grid gap-4">
        {devices.length > 0 ? (
          devices.map((d, index) => (
            <GlassCard
              key={d.device_id}
              theme={theme}
              className="glass-card-float p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              style={{ "--float-delay": `${index * 140}ms` }}
            >
              <div>
                <div className="font-semibold">{d.device_name || "Unknown Device"}</div>
                <div className="text-xs opacity-60">
                  {(t("lastActive") || "Last active") + ": "}
                  {formatLastSeen(d.last_seen, t("recently") || "Recently")}
                </div>
              </div>
              <button
                onClick={() => revokeDevice(d.device_id)}
                className="text-red-400 text-sm self-start sm:self-center"
              >
                {t("revoke") || "Revoke"}
              </button>
            </GlassCard>
          ))
        ) : (
          <GlassCard theme={theme} className="glass-card-float p-4 text-sm opacity-70">
            {t("noActiveDevices") || "No active devices found."}
          </GlassCard>
        )}
      </div>

      <UpgradeBanner show={hasAnyLimitHit} />

      {recent.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-6">{t("recent") || "Recently Used"}</h2>
          <AppGrid gpts={recent} plan={user.plan} usage={usage} onUsed={refresh} />
        </>
      )}

      <AnimatedStats stats={sampleStats} />

      <h2 className="text-lg font-semibold mt-12 mb-6">{t("gptApps") || "All GPT Apps"}</h2>
      <AppGrid plan={user.plan} usage={usage} onUsed={refresh} />

      <GlassCard theme={theme} className="glass-card-float mt-10 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">{t("aiInsight") || "AI Insight"}</h3>
            <p className="text-sm opacity-90">{insight.heading}</p>
          </div>
          <div className="w-full md:w-56">
            <div className="text-xs opacity-70 mb-1">Diversity Score</div>
            <div className="h-2 rounded bg-white/10 overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${insight.score}%`,
                  backgroundColor: "var(--accent, #facc15)",
                }}
              />
            </div>
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-zinc-200">
          {insight.lines.map((line) => (
            <li key={line} className="leading-relaxed">
              - {line}
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
