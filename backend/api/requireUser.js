// api/requireUser.js
import jwt from "jsonwebtoken";
import { db } from "./_db.js";
import { PLAN_LIMITS } from "../../config/limits.js";
import crypto from "crypto";

export async function requireUser(req, res, next) {
  const token = req.cookies?.auth;
  if (!token) return res.status(401).json({ error: "Unauthenticated" });

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const deviceId = req.headers["x-device-id"];
  if (!deviceId) {
    return res.status(400).json({ error: "Device ID missing" });
  }

  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;

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
    [user.email, deviceId]
  );

  if (!exists.rows.length) {
    return res.status(403).json({
      error: "Device limit exceeded",
      plan: user.plan,
      allowed: limits.devices,
    });
  }
}

  next();
}
