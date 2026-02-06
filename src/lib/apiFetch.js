import { getDeviceId } from "../utils/device";

export async function apiFetch(url, options = {}) {
  let path = url.startsWith("/api") ? url : `/api${url.startsWith("/") ? url : `/${url}`}`;

  const csrf = await fetch("/api/csrf", {
    credentials: "include",
  }).then(r => r.json());

  return fetch(path, {
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
