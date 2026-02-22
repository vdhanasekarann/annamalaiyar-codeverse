import { db } from "../../api/_db.js";

export async function savePaidPayment({ paymentId, email, amount, plan }) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Serialize writes for the same payment ID without requiring a unique index.
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [paymentId]);

    const existing = await client.query(
      "SELECT 1 FROM payments WHERE payment_id=$1 LIMIT 1",
      [paymentId]
    );

    if (existing.rowCount > 0) {
      await client.query("COMMIT");
      return { inserted: false };
    }

    await client.query(
      `INSERT INTO payments (payment_id,email,amount,plan,status)
       VALUES ($1,$2,$3,$4,'paid')`,
      [paymentId, email, amount, plan]
    );

    await client.query("COMMIT");
    return { inserted: true };
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback failures
    }

    // If the table already has a unique index and another writer won the race,
    // treat it as a non-fatal duplicate.
    if (err?.code === "23505") {
      return { inserted: false };
    }
    throw err;
  } finally {
    client.release();
  }
}
