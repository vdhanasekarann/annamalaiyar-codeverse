import { pool } from "@/lib/db";

const total = await pool.query(`SELECT COUNT(*) FROM users`);
const active = await pool.query(`
  SELECT COUNT(*) FROM users
  WHERE is_premium = true AND (expiry IS NULL OR expiry > NOW())
`);
const expired = await pool.query(`
  SELECT COUNT(*) FROM users
  WHERE is_premium = false OR expiry < NOW()
`);
