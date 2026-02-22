import { getDeviceId } from "../../utils/device";
import { apiFetch } from "../../lib/apiFetch";
import { useTranslation } from "react-i18next";

function detectOS(userAgent = "") {
  const ua = String(userAgent).toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "macOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "iOS";
  if (ua.includes("linux")) return "Linux";
  return "Unknown OS";
}

export default function DeviceRow({ device, onRevoked }) {
  const { t } = useTranslation();

  const revoke = async () => {
    const ok = confirm(
      (t("revokeConfirm") || "Revoke this device?") +
        "\n\n" +
        (t("revokeConfirmNote") || "You will be logged out on all devices.")
    );
    if (!ok) return;

    const res = await apiFetch("/api/account/devices/revoke", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": getDeviceId(),
      },
      body: JSON.stringify({ deviceId: device.device_id }),
    });

    if (res.ok) {
      alert(t("deviceRevoked") || "Device revoked. You will be logged out.");
      if (typeof onRevoked === "function") {
        onRevoked();
      }
      await apiFetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center gap-3">
      <div>
        <div className="text-sm font-semibold">{device.user_agent || "Unknown device"}</div>
        <div className="text-xs opacity-60">
          Last seen: {new Date(device.last_seen).toLocaleString()}
        </div>
      </div>

      <span className="text-xs bg-indigo-600 px-2 py-1 rounded ml-2">
        {detectOS(device.user_agent)}
      </span>

      <button onClick={revoke} className="text-red-400 hover:text-red-300 text-sm">
        Revoke
      </button>
    </div>
  );
}
