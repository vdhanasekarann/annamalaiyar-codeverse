import { pool } from "@/lib/db";

const TOTAL = await pool.query(`SELECT COUNT(*) FROM users`);
const ACTIVE = await pool.query(`
  SELECT COUNT(*) FROM users
  WHERE is_premium = true AND (expiry IS NULL OR expiry > NOW())
`);
const EXPIRED = await pool.query(`
  SELECT COUNT(*) FROM users
  WHERE is_premium = false OR expiry < NOW()
`);
