import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const token = req.cookies?.auth;
  if (!token) return res.status(401).json({ error: "Unauthenticated" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access only" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
