// api/requireAuth.js
import jwt from "jsonwebtoken";
import { db } from "./_db.js";

export async function requireAuth(req, res, next) {
  const token =
    req.cookies?.auth ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Unauthenticated" });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const r = await db.query(
    "SELECT token_version FROM users WHERE email=$1",
    [payload.email]
  );

  const dbTokenVersion = Number(r.rows[0]?.token_version ?? 0);
  const tokenVersion = Number(payload.tv ?? 0);

  if (!r.rows.length || !Number.isFinite(tokenVersion) || dbTokenVersion !== tokenVersion) {
    return res.status(401).json({ error: "Session expired" });
  }

  req.user = payload;
  next();
}
