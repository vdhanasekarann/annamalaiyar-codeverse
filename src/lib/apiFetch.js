import { API_BASE } from "../config/api";
import { getDeviceId } from "../utils/device";

export async function apiFetch(url, options = {}) {
  const path = url.startsWith("/") ? url : `/${url}`;

  const csrf = await fetch(`${API_BASE}/api/csrf`, {
    credentials: "include",
  }).then((r) => r.json());

  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf.csrfToken,
      "x-device-id": getDeviceId(),
      ...(options.headers || {}),
    },
  });
}
