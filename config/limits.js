// config/limits.js (BACKEND)
export const PLAN_LIMITS = {
  free: { daily: 5, devices: 1 },

  starter: { daily: Infinity, devices: 1 },
  pro: { daily: Infinity, devices: 3 },
  yearly: { daily: Infinity, devices: 1 },
  lifetime: { daily: Infinity, devices: 3 },
};
