import { API_BASE } from "../config/api";
import { getDeviceId } from "../utils/device";

let cachedCsrf = null;

export async function apiFetch(url, options = {}) {
  const path = url.startsWith("/") ? url : `/${url}`;

  if (!cachedCsrf) {
  try {
    const r = await fetch(`${API_BASE}/api/csrf`, {
      credentials: "include",
    });
    cachedCsrf = await r.json();
  } catch (err) {
    console.error("Failed to fetch CSRF token", err);
    throw new Error("CSRF init failed");
  }
}

  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": cachedCsrf.csrfToken,
      "x-device-id": getDeviceId(),
      ...(options.headers || {}),
    },
  });
}