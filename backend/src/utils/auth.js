import { API_BASE } from "../config/api";

export async function requireAuth(role) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: "include",
  });

  if (!res.ok) {
    window.location.href = "/login";
    throw new Error("Unauthenticated");
  }

  const user = await res.json();

  if (role && user.role !== role) {
    window.location.href = "/dashboard";
    throw new Error("Unauthorized");
  }

  return user;
}
