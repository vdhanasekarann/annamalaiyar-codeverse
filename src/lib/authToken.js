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
