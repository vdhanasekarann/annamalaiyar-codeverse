import jwt from "jsonwebtoken";
import { db } from "../_db";

export default async function handler(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const totalRes = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM payments
      WHERE status='paid'
    `);

    const mrrRes = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS mrr
      FROM payments
      WHERE status='paid'
      AND created_at >= date_trunc('month', CURRENT_DATE)
    `);

    const plansRes = await db.query(`
      SELECT plan,
      COUNT(DISTINCT email) AS users,
      SUM(amount) AS revenue
      FROM payments
      WHERE status='paid'
      GROUP BY plan
      ORDER BY revenue DESC
    `);

    res.json({
      total: totalRes.rows[0].total,
      mrr: mrrRes.rows[0].mrr,
      plans: plansRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}