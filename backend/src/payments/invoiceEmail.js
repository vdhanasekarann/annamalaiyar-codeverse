import { db } from "../../api/_db.js";
import { ensureInvoicePdf, generateInvoice } from "../utils/invoice.js";
import { sendInvoiceEmail } from "../utils/mailer.js";

async function getLatestInvoiceByPaymentId(paymentId) {
  const r = await db.query(
    `
      SELECT invoice_number, email, plan, amount
      FROM invoices
      WHERE payment_id=$1
      ORDER BY created_at DESC NULLS LAST
      LIMIT 1
    `,
    [paymentId]
  );
  return r.rows[0] || null;
}

async function isInvoiceAlreadySent(paymentId) {
  try {
    const r = await db.query(
      `
        SELECT invoice_sent
        FROM payments
        WHERE payment_id=$1
        ORDER BY created_at DESC NULLS LAST
        LIMIT 1
      `,
      [paymentId]
    );
    return Boolean(r.rows[0]?.invoice_sent);
  } catch {
    return false;
  }
}

async function markInvoiceSent(paymentId, invoiceNo) {
  try {
    await db.query(
      `
        UPDATE payments
        SET invoice_sent=TRUE,
            invoice_id=COALESCE(invoice_id, $2)
        WHERE payment_id=$1
      `,
      [paymentId, invoiceNo]
    );
  } catch (err) {
    console.warn("Could not mark invoice_sent on payments:", err?.message || String(err));
  }
}

export async function ensureInvoiceAndEmail({ paymentId, email, amount, plan }) {
  let created = false;
  let invoice = await getLatestInvoiceByPaymentId(paymentId);

  if (!invoice) {
    try {
      const createdInvoice = await generateInvoice({
        paymentId,
        email,
        amount,
        plan,
      });
      created = true;
      invoice = {
        invoice_number: createdInvoice.invoiceNo,
        email,
        plan,
        amount,
      };
    } catch (err) {
      // Another parallel worker may have inserted the invoice.
      if (err?.code !== "23505") {
        throw err;
      }
      invoice = await getLatestInvoiceByPaymentId(paymentId);
      if (!invoice) {
        throw err;
      }
    }
  }

  const invoiceNo = invoice.invoice_number;
  const invoiceEmail = invoice.email || email;
  const invoicePlan = invoice.plan || plan;
  const renderAmount = Number.isFinite(Number(amount)) ? Number(amount) : Number(invoice.amount || 0);

  const pdfPath = await ensureInvoicePdf({
    invoiceNo,
    paymentId,
    email: invoiceEmail,
    amount: renderAmount,
    plan: invoicePlan,
  });

  if (await isInvoiceAlreadySent(paymentId)) {
    return { created, emailed: false, invoiceNo, skipped: "already_sent" };
  }

  const sendResult = await sendInvoiceEmail(invoiceEmail, pdfPath);
  await markInvoiceSent(paymentId, invoiceNo);

  return {
    created,
    emailed: true,
    invoiceNo,
    provider: sendResult?.provider || null,
  };
}
