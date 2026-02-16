import { useEffect, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import AppGrid from "../components/AppGrid";
import UpgradeBanner from "../components/UpgradeBanner";
import { parseLimit } from "../config/limits";
import { GPTS } from "../data/gpts";
import { API_BASE } from "../config/api";
import { getDeviceId } from "../utils/device";
import { apiFetch } from "../lib/apiFetch";
import { useUsage } from "../hooks/useUsage";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const [localUsage, setUsage] = useState({});
  const { user, setUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const { usage, refresh } = useUsage(user?.email);
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open,setOpen] = useState(false);
  
  const [recent,setRecent] = useState([]);

  function handleSearch(q){
  navigate(`/gpts?q=${q}`);
}

const recentIds = JSON.parse(localStorage.getItem("recentGPTs") || "[]");
const recentGPTs = GPTS.filter(g => recentIds.includes(g.id));

useEffect(()=>{
  const ids = JSON.parse(localStorage.getItem("recentGPTs") || "[]");
  setRecent(GPTS.filter(g=>ids.includes(g.id)));
},[]);

  const revokeDevice = async (deviceId) => {
  await apiFetch("/api/account/devices/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId }),
    credentials: "include"
  });

  setDevices(prev => prev.filter(d => d.device_id !== deviceId));
};

useEffect(()=>{
 const close=()=>setOpen(false);
 document.addEventListener("click",close);
 return()=>document.removeEventListener("click",close);
},[]);

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

  if (authLoading || loading) {
    return <div className="text-white p-6">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAnyLimitHit =
    user.plan === "free" &&
    GPTS.some(g => (usage[g.id] || 0) >= parseLimit(g.freeLimit));

  function WelcomeBanner({ user }) {
    return (
      <div className="rounded-2xl p-6 mb-10 bg-gradient-to-br from-orange-400 via-indigo-500 to-black">
        <h1 className="text-xl md:text-3xl font-bold mb-2 truncate">
          {t("welcome") || "Welcome back"}, {user.email.split("@")[0]}
        </h1>
        <p className="opacity-90">Build the future with CodeVerse AI</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <WelcomeBanner user={user} />

        <div className="absolute top-6 right-6 z-40">
          <div className="relative">
            <button
              onClick={(e)=>{e.stopPropagation(); setOpen(o=>!o);}}
              className="px-4 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 shadow"
            >
              {t("aiTools") || "AI Tools ▾"}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-black/70 backdrop-blur rounded-xl border border-white/10">
                {[
                  ["ChatGPT", "https://chat.openai.com"],
                  ["Claude", "https://claude.ai"],
                  ["Gemini", "https://gemini.google.com"],
                  ["Copilot", "https://copilot.microsoft.com"],
                  ["CooklyHub", "https://cooklyhub.com"],
                  ["CA-sentinel", "https://ca.kannizconites.com"],
                ].map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer" className="block px-4 py-2 hover:bg-indigo-600">
                    {name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Background controls */}
        <div className="absolute top-6 right-36 z-40 flex items-center gap-2">
          <label className="text-xs text-zinc-200 bg-zinc-800/60 px-3 py-2 rounded cursor-pointer">
            Change BG
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const key = `bg_${user.email}`;
                    localStorage.setItem(key, reader.result);
                    window.dispatchEvent(new Event('bgChange'));
                  } catch (err) {
                    console.error(err);
                  }
                };
                reader.readAsDataURL(f);
              }}
            />
          </label>
          <button
            onClick={() => {
              try {
                const key = `bg_${user.email}`;
                localStorage.removeItem(key);
                window.dispatchEvent(new Event('bgChange'));
              } catch (e) {}
            }}
            className="text-xs text-zinc-200 bg-zinc-800/40 px-3 py-2 rounded"
          >
            Clear BG
          </button>
        </div>
      </div>
      <h2 className="text-lg font-semibold mt-12 mb-4">{t("activeDevices") || "Active Devices"}</h2>

<div className="grid gap-4">
  {devices && devices.length > 0 ? (
    devices.map((d) => (
      <div key={d.device_id} className="bg-zinc-900 rounded-xl p-4 flex justify-between">
        <div>
          <div className="font-semibold">
            {d.device_name || "Unknown Device"}
          </div>
          <div className="text-xs opacity-60">
            Last active: {d.last_seen || "Recently"}
          </div>
        </div>
        <button
          onClick={() => revokeDevice(d.device_id)}
          className="text-red-400"
        >
          Revoke
        </button>
      </div>
    ))
  ) : (
    <div className="text-sm opacity-60">
      No active devices found.
    </div>
  )}
</div>

    <UpgradeBanner show={hasAnyLimitHit} />

    {recentGPTs.length > 0 && (
      <>
        <h2 className="text-lg font-semibold mb-6">{t("recent") || "Recently Used"}</h2>

        <AppGrid gpts={recentGPTs} plan={user.plan} usage={usage} onUsed={refresh} />
      </>
    )}


    <h2 className="text-lg font-semibold mt-12 mb-6">{t("gptApps") || "All GPT Apps"}</h2>

    <AppGrid
      plan={user.plan}
      usage={usage}
      onUsed={refresh}
    />
    <div className="mt-10 p-6 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700">
      <h3 className="font-bold text-lg mb-2">{t("aiInsight") || "AI Insight"}</h3>
      <p className="text-sm opacity-90">
        {t("aiInsightText") ||
          "You are most active in Education category apps. Try more Lifestyle GPTs to balance your usage."}
      </p>
    </div>

  </>
  );
}