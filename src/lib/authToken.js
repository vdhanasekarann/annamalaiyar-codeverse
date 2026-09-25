const AUTH_TOKEN_KEY = "cv_auth_token";

let volatileAuthToken = "";

export function getAuthToken() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || "";
    volatileAuthToken = token;
    return token;
  } catch {
    return volatileAuthToken;
  }
}

export function getCachedAuthUser() {
  const token = getAuthToken();
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) return null;

  try {
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (!payload.email || !Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return {
      email: payload.email,
      role: payload.role || "user",
      plan: payload.plan || "free",
      tv: Number(payload.tv ?? 0),
    };
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  const value = typeof token === "string" ? token : "";
  volatileAuthToken = value;

  try {
    if (!value) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      localStorage.setItem(AUTH_TOKEN_KEY, value);
    }
  } catch {
    // no-op
  }
}

export function clearAuthToken() {
  volatileAuthToken = "";
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // no-op
  }
}
