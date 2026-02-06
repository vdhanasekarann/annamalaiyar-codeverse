import jwt from "jsonwebtoken";

export function requireAdmin(req) {
  const auth = req.headers.authorization;
  if (!auth) throw new Error("No token");

  const token = auth.replace("Bearer ", "");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.role !== "admin") {
    throw new Error("Forbidden");
  }

  return decoded;
}
