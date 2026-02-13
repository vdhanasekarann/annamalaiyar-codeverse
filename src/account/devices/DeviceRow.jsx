import { API_BASE } from "../../config/api";
import { getDeviceId } from "../../utils/device";
import { Navigate, Link } from "react-router-dom";

export default function DeviceRow({ device, onRevoked }) {
  const revoke = async () => {
    const ok = confirm(
      "Revoke this device?\n\nYou will be logged out on all devices."
    );
    if (!ok) return;

    const res = await apiFetch(`${API_BASE}/api/account/devices/revoke`, {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "x-device-id": getDeviceId(),
  },
  body: JSON.stringify({ deviceId: device.device_id }),
});

    if (res.ok) {
      alert("Device revoked. You will be logged out.");
      await apiFetch("/auth/logout");
      window.location.href = "/login";
    }
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center">
      <div>
        <div className="text-sm font-semibold">
          {device.user_agent || "Unknown device"}
        </div>
        <div className="text-xs opacity-60">
          Last seen: {new Date(device.last_seen).toLocaleString()}
        </div>
      </div>

      <button
        onClick={revoke}
        className="text-red-400 hover:text-red-300 text-sm"
      >
        Revoke
      </button>
    </div>
  );
}
