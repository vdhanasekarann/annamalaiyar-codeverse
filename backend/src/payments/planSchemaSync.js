import { db } from "../../api/_db.js";

const PLAN_COLUMNS = [
  { table: "users", column: "plan" },
  { table: "payments", column: "plan" },
  { table: "invoices", column: "plan" },
];

function isSafeIdentifier(name) {
  return typeof name === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

function sqlString(value) {
  return String(value).replace(/'/g, "''");
}

export function isPlanConstraintError(err) {
  const message = String(err?.message || "");
  return (
    err?.code === "22P02" ||
    err?.code === "23514" ||
    /invalid input value for enum/i.test(message) ||
    /violates check constraint/i.test(message)
  );
}

async function ensureEnumValueForColumn(table, column, plan) {
  const col = await db.query(
    `
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name=$1 AND column_name=$2
      LIMIT 1
    `,
    [table, column]
  );

  if (!col.rows.length) return false;

  const { data_type: dataType, udt_name: udtName } = col.rows[0];
  if (dataType !== "USER-DEFINED" || !isSafeIdentifier(udtName)) {
    return false;
  }

  const hasValue = await db.query(
    `
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = $1 AND e.enumlabel = $2
      LIMIT 1
    `,
    [udtName, plan]
  );

  if (hasValue.rowCount > 0) return true;

  const safePlan = sqlString(plan);
  await db.query(`ALTER TYPE "${udtName}" ADD VALUE IF NOT EXISTS '${safePlan}'`);
  return true;
}

export async function runWithPlanSchemaSync(plan, action) {
  try {
    return await action();
  } catch (err) {
    if (!isPlanConstraintError(err)) {
      throw err;
    }

    let syncedAny = false;
    for (const target of PLAN_COLUMNS) {
      try {
        const synced = await ensureEnumValueForColumn(target.table, target.column, plan);
        syncedAny = syncedAny || synced;
      } catch (syncErr) {
        console.warn("Plan schema sync failed", {
          table: target.table,
          column: target.column,
          error: syncErr?.message || String(syncErr),
        });
      }
    }

    if (!syncedAny) {
      throw err;
    }

    return action();
  }
}
