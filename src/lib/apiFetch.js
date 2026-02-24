import { API_BASE } from "../config/api";
import { getDeviceId } from "../utils/device";
import { getAuthToken } from "./authToken";

let cachedCsrfToken = null;

function isUnsafeMethod(method) {
  const m = (method || "GET").toUpperCase();
  return m !== "GET" && m !== "HEAD" && m !== "OPTIONS";
}

function needsCsrf(path, method) {
  if (!isUnsafeMethod(method)) return false;

  // Auth endpoints are intentionally not CSRF-guarded server-side.
  // Skipping CSRF bootstrap here avoids mobile WebView cookie edge-cases.
  return !path.startsWith("/api/auth/");
}

async function fetchCsrfToken() {
  const res = await fetch(`${API_BASE}/api/csrf`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`CSRF init failed (${res.status})`);
  }

  const data = await res.json();
  if (!data?.csrfToken) {
    throw new Error("CSRF token missing");
  }

  cachedCsrfToken = data.csrfToken;
  return cachedCsrfToken;
}

export async function apiFetch(url, options = {}) {
  const path = url.startsWith("/") ? url : `/${url}`;
  const method = (options.method || "GET").toUpperCase();
  const unsafe = needsCsrf(path, method);

  const headers = new Headers(options.headers || {});

  if (!headers.has("x-device-id")) {
    headers.set("x-device-id", getDeviceId());
  }

  if (!headers.has("Authorization")) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (unsafe) {
    if (!cachedCsrfToken) {
      await fetchCsrfToken();
    }
    headers.set("X-CSRF-Token", cachedCsrfToken);
  }

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
    ...options,
      method,
      credentials: "include",
      headers,
    });

  let res = await doFetch();

  if (unsafe && res.status === 403) {
    // Recover from stale/rotated CSRF by fetching a new token once and retrying.
    await fetchCsrfToken();
    headers.set("X-CSRF-Token", cachedCsrfToken);
    res = await doFetch();
  }

  return res;
}
