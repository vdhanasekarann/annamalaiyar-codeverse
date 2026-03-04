import jwt from "jsonwebtoken";
import { db } from "./_db.js";

export async function requireAdmin(req, res, next) {
  const token =
    req.cookies?.auth ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }

  const r = await db.query(
    "SELECT token_version, blocked FROM users WHERE email=$1",
    [user.email]
  );

  if (!r.rows.length) {
    return res.status(401).json({ error: "User not found" });
  }

  const userRow = r.rows[0];
  if (userRow.blocked) {
    return res.status(403).json({ error: "Account blocked" });
  }

  const dbTokenVersion = Number(userRow.token_version ?? 0);
  const tokenVersion = Number(user.tv ?? 0);

  if (!Number.isFinite(tokenVersion) || dbTokenVersion !== tokenVersion) {
    return res.status(401).json({ error: "Session expired" });
  }

  req.user = user;
  next();
}
