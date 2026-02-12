import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
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
  const [setUsage] = useState({});
  const [loading, setLoading] = useState(true);
  const { usage, refresh } = useUsage(user?.email);

  useEffect(() => {
  let mounted = true;

  async function load() {
    try {
      const meRes = await apiFetch("/api/auth/me");

      const res = await apiFetch("/api/account/devices");
      const devices = await res.json();

      if (!meRes.ok) throw new Error("unauth");

      const me = await meRes.json();
      if (!mounted) return;

      setUser(me);

      const uRes = await fetch(
        `${API_BASE}/api/usage?email=${me.email}`,
        {
          credentials: "include",
          headers: { "x-device-id": getDeviceId() },
        }
      );

      const usageData = uRes.ok ? await uRes.json() : {};
      if (!mounted) return;

      setUsage(usageData);
    } catch {
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

  return (
    <div
      className="bg-[#0f0f0f] min-h-screen text-white"
      style={{
        backgroundImage: "url('/bg-galaxy.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <UpgradeBanner show={hasAnyLimitHit} />
      <AppGrid
  plan={user.plan}
  usage={usage}
  onUsed={refresh}
/>
   </div>
  );
}