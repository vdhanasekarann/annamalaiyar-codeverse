import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { API_BASE } from "../../config/api";
import { getDeviceId } from "../../utils/device";
import DeviceRow from "./DeviceRow";
import { Navigate, Link } from "react-router-dom";

export default function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await apiFetch(`${API_BASE}/api/account/devices`, {
      credentials: "include",
      headers: { "x-device-id": getDeviceId() },
    });

    if (res.ok) {
      setDevices(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const { t } = useTranslation();

  if (loading) {
    return <div className="text-white p-6">{t('loadingDevices')||'Loading devices…'}</div>;
  }

  return (
    <div className="space-y-3">
      {devices.map(d => (
        <DeviceRow key={d.device_id} device={d} onRevoked={load} />
      ))}
    </div>
  );
}
