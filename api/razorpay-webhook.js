import crypto from "crypto";
import { db } from "./_db.js";
import { generateInvoice } from "../src/utils/invoice.js";
import { sendInvoiceEmail } from "../src/utils/mailer.js";

export async function razorpayWebhook(req, res) {
  const signature = req.headers["x-razorpay-signature"];

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body) // ⚠️ RAW BODY
    .digest("hex");

  if (signature !== expected) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "payment.captured") {
    const p = event.payload.payment.entity;
    const { email, plan } = p.notes;

    if (!email || !plan) return res.json({ ok: true });

    // 1️⃣ Save payment
    await db.query(
      `INSERT INTO payments (payment_id,email,amount,plan,status)
       VALUES ($1,$2,$3,$4,'paid')
       ON CONFLICT (payment_id) DO NOTHING`,
      [p.id, email, p.amount / 100, plan]
    );

    // 2️⃣ Upgrade plan
    const validPlans = ["starter", "pro", "yearly", "lifetime"];
    const finalPlan = validPlans.includes(plan) ? plan : "free";

    await db.query(
      `UPDATE users SET plan=$2 WHERE email=$1`,
      [email, finalPlan]
    );

    // 3️⃣ Generate invoice + email
    const invoice = await generateInvoice({
      paymentId: p.id,
      email,
      plan,
      amount: p.amount / 100,
    });

    await sendInvoiceEmail(email, invoice.pdfPath);
  }

  res.json({ ok: true });
}