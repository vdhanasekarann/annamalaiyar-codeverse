import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import AppGrid from "../components/AppGrid";
import UpgradeBanner from "../components/UpgradeBanner";
import { parseLimit } from "../config/limits";
import { GPTS } from "../data/gpts";
import { API_BASE } from "../config/api";
import { getDeviceId } from "../utils/device";
import { apiFetch } from "../lib/apiFetch";
import { useUsage } from "../hooks/useUsage";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [localUsage, setUsage] = useState({});
  const [loading, setLoading] = useState(true);
  const { usage, refresh } = useUsage(user?.email);
  const [devices, setDevices] = useState([]);

  const revokeDevice = async (id) => {
      await apiFetch(`/api/account/devices/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setDevices(prev => prev.filter(d => d.id !== id));
    };

    navigate(`/gpts?q=${query}`)

  useEffect(() => {
  let mounted = true;

  async function load() {
  try {
    const meRes = await apiFetch("/api/auth/me");

    if (!meRes.ok) throw new Error("unauth");

    const me = await meRes.json();
    if (!mounted) return;

    setUser(me);

    // 🔥 Fetch devices AFTER confirming auth
    const res = await apiFetch("/api/account/devices");
    const devicesData = res.ok ? await res.json() : [];
    setDevices(devicesData);

    const deviceId = getDeviceId();

    const exists = devicesData.some(d => d.device_id === deviceId);

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
    setUser(null);
  } finally {
    if (mounted) setLoading(false);
  }
}
  load();
  return () => { mounted = false; };
}, []);

  if (loading) {
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
    <div className="rounded-2xl p-8 mb-10 bg-gradient-to-br from-orange-400 via-indigo-500 to-black">
      <h1 className="text-3xl font-bold mb-2">
        Welcome back, {user.email.split("@")[0]}
      </h1>
      <p className="opacity-90">
        Build the future with CodeVerse AI
      </p>
    </div>
  );
}

  return (
        <div
      className="min-h-screen bg-[#0f0f0f] text-white p-6"
      style={{
        backgroundImage: "url('/bg-galaxy.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute z-50 hidden group-hover:block bg-zinc-900 mt-2 rounded shadow-lg text-sm">
  <button className="px-4 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 shadow">
    AI Tools ▾
  </button>

  <div className="absolute hidden group-hover:block bg-zinc-900 mt-2 rounded shadow-lg text-sm">
    <a href="https://chat.openai.com" target="_blank" className="block px-4 py-2 hover:bg-indigo-600">ChatGPT</a>
    <a href="https://claude.ai" target="_blank" className="block px-4 py-2 hover:bg-indigo-600">Claude</a>
    <a href="https://gemini.google.com" target="_blank" className="block px-4 py-2 hover:bg-indigo-600">Gemini</a>
    <a href="https://copilot.microsoft.com" target="_blank" className="block px-4 py-2 hover:bg-indigo-600">Copilot</a>
  </div>
</div>

       <WelcomeBanner user={user} />
       <h2 className="text-lg font-semibold mt-12 mb-4">
  Active Devices
</h2>

<div className="grid gap-4">
  {devices && devices.length > 0 ? (
    devices.map(d => (
      <div
        key={d.id}
        className="bg-zinc-900 rounded-xl p-4 flex justify-between"
      >
        <div>
          <div className="font-semibold">
            {d.device_name || "Unknown Device"}
          </div>
          <div className="text-xs opacity-60">
            Last active: {d.last_seen || "Recently"}
          </div>
        </div>
        <button
          onClick={() => revokeDevice(d.id)}
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

    <h2 className="text-lg font-semibold mb-6">Continue Using</h2>

    <AppGrid
      plan={user.plan}
      usage={usage}
      onUsed={refresh}
      limit={4} 
    />

    <h2 className="text-lg font-semibold mt-12 mb-6">All GPT Apps</h2>

    <AppGrid
      plan={user.plan}
      usage={usage}
      onUsed={refresh}
    />

  </div>
);
}