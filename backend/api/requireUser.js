// api/requireUser.js
import jwt from "jsonwebtoken";
import { db } from "./_db.js";
import { PLAN_LIMITS } from "../../config/limits.js";
import crypto from "crypto";
import { isValidPlan } from "../src/payments/plans.js";

export async function requireUser(req, res, next) {
  const token =
    req.cookies?.auth ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Unauthenticated" });

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const userRowRes = await db.query(
    "SELECT token_version, plan, blocked FROM users WHERE email=$1",
    [user.email]
  );

  if (!userRowRes.rows.length) {
    return res.status(401).json({ error: "User not found" });
  }

  const userRow = userRowRes.rows[0];
  const dbTokenVersion = Number(userRow.token_version ?? 0);
  const tokenVersion = Number(user.tv ?? 0);
  if (!Number.isFinite(tokenVersion) || dbTokenVersion !== tokenVersion) {
    return res.status(401).json({ error: "Session expired" });
  }

  if (userRow.blocked) {
    return res.status(403).json({ error: "Account blocked" });
  }

  let paidPlan = null;
  try {
    const paidRes = await db.query(
      `
      SELECT plan
      FROM payments
      WHERE email=$1 AND status='paid'
      ORDER BY created_at DESC NULLS LAST
      LIMIT 1
      `,
      [user.email]
    );
    paidPlan = paidRes.rows[0]?.plan || null;
  } catch {
    // Non-fatal fallback when payments schema differs.
  }

  const effectivePlan =
    (isValidPlan(paidPlan) && paidPlan) ||
    (isValidPlan(user.plan) && user.plan) ||
    (isValidPlan(userRow.plan) && userRow.plan) ||
    "free";
  req.user = { ...user, plan: effectivePlan };

  const fallbackDeviceId = crypto
    .createHash("sha256")
    .update(`${req.ip || ""}|${req.headers["user-agent"] || ""}`)
    .digest("hex")
    .slice(0, 24);
  const deviceId = req.headers["x-device-id"] || `fallback-${fallbackDeviceId}`;

  const limits = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.free;

  const ipHash = crypto
    .createHash("sha256")
    .update(req.ip || "")
    .digest("hex");

  await db.query(
    `
    INSERT INTO user_devices (email, device_id, last_seen, user_agent, ip_hash)
    VALUES ($1,$2,NOW(),$3,$4)
    ON CONFLICT (email, device_id)
    DO UPDATE SET last_seen=NOW()
    `,
    [user.email, deviceId, req.headers["user-agent"], ipHash]
  );

  const r = await db.query(
    `SELECT COUNT(*)::int FROM user_devices WHERE email=$1`,
    [user.email]
  );

  const deviceCount = r.rows[0].count;
  
  if (deviceCount > limits.devices) {
  const exists = await db.query(
    `SELECT 1 FROM user_devices WHERE email=$1 AND device_id=$2`,
    [req.user.email, deviceId]
  );

  if (!exists.rows.length) {
    return res.status(403).json({
      error: "Device limit exceeded",
      plan: effectivePlan,
      allowed: limits.devices,
    });
  }
}

  next();
}
