import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DeviceRow from "./DeviceRow";
import { apiFetch } from "../../lib/apiFetch";
import { getDeviceId } from "../../utils/device";

export default function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const res = await apiFetch("/api/account/devices", {
        credentials: "include",
        headers: { "x-device-id": getDeviceId() },
      });

      if (!mounted) return;

      if (res.ok) {
        setDevices(await res.json());
      } else {
        setDevices([]);
      }
      setLoading(false);
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [reloadTick]);

  const handleRevoked = () => {
    setLoading(true);
    setReloadTick((n) => n + 1);
  };

  if (loading) {
    return <div className="text-white p-6">{t("loadingDevices") || "Loading devices..."}</div>;
  }

  return (
    <div className="space-y-3">
      {devices.map((d) => (
        <DeviceRow key={d.device_id} device={d} onRevoked={handleRevoked} />
      ))}
    </div>
  );
}
