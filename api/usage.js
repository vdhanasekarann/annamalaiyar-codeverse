// api/usage.js
import { db } from "./_db.js";

export default async function handler(req, res) {
  const { email, gpt } = req.method === "POST" ? req.body : req.query;
  if (!email || !gpt) return res.json({ used: 0 });

  const today = new Date().toISOString().slice(0, 10);

  if (req.method === "POST") {
    await db.query(
      `INSERT INTO usage (email,gpt,date,count)
       VALUES ($1,$2,$3,1)
       ON CONFLICT (email,gpt,date)
       DO UPDATE SET count = usage.count + 1`,
      [email, gpt, today]
    );
  }

  const r = await db.query(
    "SELECT count FROM usage WHERE email=$1 AND gpt=$2 AND date=$3",
    [email, gpt, today]
  );

  res.json({ used: r.rows[0]?.count || 0 });
}