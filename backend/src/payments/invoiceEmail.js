import { db } from "../../api/_db.js";
import { generateInvoice } from "../utils/invoice.js";
import { sendInvoiceEmail } from "../utils/mailer.js";

export async function ensureInvoiceAndEmail({ paymentId, email, amount, plan }) {
  const existing = await db.query(
    `SELECT 1 FROM invoices WHERE payment_id=$1 LIMIT 1`,
    [paymentId]
  );

  if (existing.rowCount > 0) {
    return { created: false, emailed: false };
  }

  try {
    const invoice = await generateInvoice({
      paymentId,
      email,
      amount,
      plan,
    });

    await sendInvoiceEmail(email, invoice.pdfPath);
    return { created: true, emailed: true, invoiceNo: invoice.invoiceNo };
  } catch (err) {
    // Another concurrent worker can create the invoice first.
    if (err?.code === "23505") {
      return { created: false, emailed: false };
    }
    throw err;
  }
}
