import { db } from "./_db.js";

export default async function handler(req, res) {
  try {
    const { email } = req.query;
    if (!email) return res.json({ plan: "free" });

    const r = await db.query(
      "SELECT plan FROM users WHERE email=$1 LIMIT 1",
      [email]
    );

    res.json({ plan: r.rows[0]?.plan || "free" });
  } catch (e) {
    console.error(e);
    res.json({ plan: "free" });
  }
}