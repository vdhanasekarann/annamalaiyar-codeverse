import crypto from "crypto";
import { Buffer } from "node:buffer";
import { db } from "./_db.js";
import { isExpectedPlanAmount, isValidPlan } from "../src/payments/plans.js";
import { ensureInvoiceAndEmail } from "../src/payments/invoiceEmail.js";
import { isPlanConstraintError, runWithPlanSchemaSync } from "../src/payments/planSchemaSync.js";
import { savePaidPayment } from "../src/payments/paymentWrite.js";

function timingSafeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;

  let aBuf;
  let bBuf;
  try {
    aBuf = Buffer.from(a, "hex");
    bBuf = Buffer.from(b, "hex");
  } catch {
    return false;
  }

  if (!aBuf.length || aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function razorpayWebhook(req, res) {
  const traceId = crypto.randomUUID();
  try {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return res.status(500).json({ error: "Webhook misconfigured" });
    }

    if (!Buffer.isBuffer(req.body)) {
      console.error("Webhook payload is not raw Buffer");
      return res.status(400).json({ error: "Invalid webhook payload format" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (!timingSafeEqualHex(String(signature || ""), expectedSignature)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    let event;
    try {
      event = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "Invalid webhook JSON" });
    }

    if (event?.event !== "payment.captured") {
      return res.json({ ok: true });
    }

    const payment = event?.payload?.payment?.entity;
    const { email, plan } = payment?.notes || {};

    if (!payment?.id || !email || !isValidPlan(plan)) {
      return res.json({ ok: true });
    }

    if (!isExpectedPlanAmount(plan, payment.amount)) {
      console.warn("Webhook amount mismatch", {
        paymentId: payment.id,
        plan,
        amount: payment.amount,
      });
      return res.json({ ok: true });
    }

    if (payment.status !== "captured" && !payment.captured) {
      return res.json({ ok: true });
    }

    const persistence = {
      paymentRecorded: false,
      userPlanStored: false,
      invoiceEmailed: false,
    };

    try {
      await runWithPlanSchemaSync(plan, async () => {
        const saved = await savePaidPayment({
          paymentId: payment.id,
          email,
          amount: payment.amount / 100,
          plan,
        });
        persistence.paymentRecorded = Boolean(saved.inserted);
      });
    } catch (paymentErr) {
      console.warn(`[webhook:${traceId}] payment persistence failed`, {
        paymentId: payment.id,
        code: paymentErr?.code,
        error: paymentErr?.message || String(paymentErr),
      });
    }

    try {
      await runWithPlanSchemaSync(plan, async () => {
        await db.query(`UPDATE users SET plan=$2 WHERE email=$1`, [email, plan]);
      });
      persistence.userPlanStored = true;
    } catch (userPlanErr) {
      console.warn(`[webhook:${traceId}] user plan update failed`, {
        email,
        plan,
        code: userPlanErr?.code,
        error: userPlanErr?.message || String(userPlanErr),
      });
    }

    try {
      await ensureInvoiceAndEmail({
        paymentId: payment.id,
        email,
        plan,
        amount: payment.amount / 100,
      });
      persistence.invoiceEmailed = true;
    } catch (invoiceErr) {
      console.error("Webhook invoice/email failed", {
        paymentId: payment.id,
        error: invoiceErr?.message || String(invoiceErr),
      });
    }

    return res.json({ ok: true, traceId, ...persistence });
  } catch (err) {
    if (isPlanConstraintError(err)) {
      console.error(`[webhook:${traceId}] plan schema mismatch:`, err);
      return res.status(409).json({ error: "Plan schema mismatch" });
    }
    console.error(`[webhook:${traceId}] processing failed:`, err);
    return res.status(500).json({ error: "Webhook processing failed", traceId });
  }
}
