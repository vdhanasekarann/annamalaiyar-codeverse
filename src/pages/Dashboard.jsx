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
    const devices = res.ok ? await res.json() : [];

    const deviceId = getDeviceId();

    const exists = devices.some(d => d.device_id === deviceId);

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
       <WelcomeBanner user={user} />

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