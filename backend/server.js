import "dotenv/config";
import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import { db } from "./api/_db.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { v4 as uuid } from "uuid";
import { requireAuth } from "./api/requireAuth.js";
import { requireUser } from "./api/requireUser.js";
import { requireAdmin } from "./api/requireAdmin.js";
import { razorpayWebhook } from "./api/razorpay-webhook.js";
import { generateInvoice } from "./src/utils/invoice.js";
import { sendInvoiceEmail } from "./src/utils/mailer.js";
import csrf from "csurf";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import os from "os";

async function logAudit(actor, action, target) {
  await db.query(
    `
    INSERT INTO audit_logs (id, actor_email, action, target)
    VALUES ($1,$2,$3,$4)
    `,
    [uuid(), actor, action, target]
  );
}

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());

const resend = new Resend(process.env.RESEND_API_KEY);

const csrfProtection = csrf({ cookie: true });

// NOTE: make sure you don't register the razorpay webhook twice.
// (We removed any prior shorthand registration; the explicit handler is included below.)

app.use("/api/admin", csrfProtection);
app.use("/api/account", (req, res, next) => {
  if (req.method === "GET") return next();
  csrfProtection(req, res, next);
});

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
  })
);

// Auth check only (NO device)
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json(req.user);
});

app.post(
  "/api/razorpay/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

/* ---------- RAZORPAY ---------- */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// User routes (AUTH + DEVICE)
app.get("/api/account/devices", requireUser, async (req, res) => {
  const r = await db.query(
    `
    SELECT device_id, last_seen, user_agent
    FROM user_devices
    WHERE email=$1
    ORDER BY last_seen DESC
    `,
    [req.user.email]
  );
  res.json(r.rows);
});

app.post("/api/create-order", requireUser, async (req, res) => {
  try {
    console.log("create-order called, req.user:", req.user);
    console.log("create-order headers x-device-id:", req.headers["x-device-id"]);
    console.log("create-order body:", req.body);

    const { plan } = req.body;
    const email = req.user?.email;

    if (!plan || !email) {
      console.warn("create-order missing plan or email", { plan, email });
      return res.status(400).json({ error: "Missing plan or email" });
    }

    const amountMap = {
      starter: 1 * 100,
      pro: 3 * 100,
      yearly: 1999 * 100,
      lifetime: 6999 * 100,
    };

    if (!amountMap[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const order = await razorpay.orders.create({
      amount: amountMap[plan],
      currency: "INR",
      notes: {
        plan,
        email,
        product: "Annamalaiyar CodeVerse AI OS",
      },
    });

    res.json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

/* ---------- AUTH ---------- */
app.post("/api/auth/login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  await logAudit(email, "LOGIN", "self");

  await db.query(
    `INSERT INTO users (email)
     VALUES ($1)
     ON CONFLICT (email) DO NOTHING`,
    [email]
  );

  const r = await db.query(
    "SELECT email, role, plan, token_version FROM users WHERE email=$1",
    [email]
  );

  const user = r.rows[0];

  const token = jwt.sign(
    {
      email: user.email,
      role: user.role,
      plan: user.plan,
      tv: user.token_version,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("auth", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ ok: true });
});

app.post("/api/auth/logout", (_, res) => {
  res.clearCookie("auth");
  res.json({ ok: true });
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing credential" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email } = ticket.getPayload();

    await db.query(
      `INSERT INTO users (email)
       VALUES ($1)
       ON CONFLICT (email) DO NOTHING`,
      [email]
    );

    const r = await db.query(
      "SELECT email, role, plan, token_version FROM users WHERE email=$1",
      [email]
    );

    const user = r.rows[0];

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        plan: user.plan,
        tv: user.token_version,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("auth", token, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(401).json({ error: "Google authentication failed" });
  }
});

const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/api/auth/magic-link", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");

    await db.query(
      `INSERT INTO magic_links (id, email, token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')`,
      [uuid(), email, hash]
    );

    const link = `http://localhost:5173/magic-login?token=${token}`;

    // 1) Try Resend
    try {
      const resp = await resend.emails.send({
        from: "CodeVerse <hello@aicodeverse.com>",
        to: email,
        subject: "Your secure login link – CodeVerse AI OS",
        html: `<p>Click to sign in:</p>
        <p><a href="${link}">Secure Login</a></p>
        <p>Expires in 15 minutes.</p>`,
    });

      console.log("Resend send response:", resp);
      if (resp && resp.error) throw resp.error;

      return res.json({ ok: true, via: "resend" });
    } catch (resendErr) {
      console.warn("Resend failed:", resendErr?.message || resendErr);
      // 2) Try SMTP fallback (Gmail). This will fail if SMTP credentials are invalid.
      try {
        const info = await smtpTransporter.sendMail({
          from: process.env.FROM_EMAIL || process.env.SMTP_USER,
          to: email,
          subject: "Your secure login link – CodeVerse AI OS",
          html: `<p>Click to sign in:</p><p><a href="${link}">Secure Login</a></p><p>Expires in 15 minutes.</p>`,
        });
        console.log("SMTP fallback sent:", info);
        return res.json({ ok: true, via: "smtp" });
      } catch (smtpErr) {
        console.warn("SMTP fallback failed:", smtpErr?.message || smtpErr);
        // 3) Dev-only fallback: use ethereal (nodemailer test account) OR return the link in response.
        if (process.env.NODE_ENV !== "production") {
          // create test account and send preview, or simply return link to developer
          try {
            const testAccount = await nodemailer.createTestAccount();
            const testTransport = nodemailer.createTransport({
              host: "smtp.ethereal.email",
              port: 587,
              auth: { user: testAccount.user, pass: testAccount.pass },
            });
            const info = await testTransport.sendMail({
              from: process.env.FROM_EMAIL || testAccount.user,
              to: email,
              subject: "DEV magic link – CodeVerse",
              html: `<p>Click: <a href="${link}">${link}</a></p>`,
            });
            console.log("Ethereal preview URL:", nodemailer.getTestMessageUrl(info));
            return res.json({ ok: true, via: "dev", devLink: link, previewUrl: nodemailer.getTestMessageUrl(info) });
          } catch (ethErr) {
            console.warn("Ethereal send failed:", ethErr?.message || ethErr);
          }

          // As a last resort return the link in the JSON response so you can click it in dev
          return res.json({ ok: true, via: "dev", devLink: link });
        }

        // production: fail and return clear error
        return res.status(500).json({ error: "Failed to send magic link (resend & smtp failed). Check logs." });
      }
    }
  } catch (err) {
    console.error("Magic link handler error:", err);
    res.status(500).json({ error: "Internal server error sending magic link" });
  }
});

app.get("/api/auth/magic-verify", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Invalid link");

  const hash = crypto.createHash("sha256").update(token).digest("hex");

  const r = await db.query(
    `
    SELECT * FROM magic_links
    WHERE token_hash=$1 AND used=FALSE AND expires_at > NOW()
    `,
    [hash]
  );

  if (!r.rows.length) {
    return res.status(401).send("Link expired or invalid");
  }

  const { email, id } = r.rows[0];

  await db.query(`UPDATE magic_links SET used=TRUE WHERE id=$1`, [id]);

  await db.query(
    `INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
    [email]
  );

  const u = await db.query(
    "SELECT email, role, plan, token_version FROM users WHERE email=$1",
    [email]
  );

  const user = u.rows[0];

  const jwtToken = jwt.sign(
    {
      email: user.email,
      role: user.role,
      plan: user.plan,
      tv: user.token_version,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("auth", jwtToken, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});

/* ---------- ADMIN: REVENUE (AUTO CALCULATED) ---------- */
app.get("/api/admin/revenue", requireAdmin, async (req, res) => {
  const r = await db.query(`
    SELECT 
      plan,
      COUNT(*)::int AS users,
      SUM(
        CASE 
          WHEN plan = 'starter' THEN 199
          WHEN plan = 'pro' THEN 399
          WHEN plan = 'yearly' THEN 1999
          WHEN plan = 'lifetime' THEN 9999
          ELSE 0
        END
      )::int AS revenue
    FROM users
    WHERE blocked = FALSE
    GROUP BY plan
  `);

  res.json({ plans: r.rows });
});

app.get("/api/usage", requireUser, async (req, res) => {
  const { email } = req.query;
  if (!email) return res.json({});

  const r = await db.query(
    `
    SELECT gpt, SUM(count)::int AS used
    FROM usage
    WHERE email=$1 AND date=CURRENT_DATE
    GROUP BY gpt
    `,
    [email]
  );

  const usage = {};
  r.rows.forEach((row) => {
    usage[row.gpt] = row.used;
  });

  res.json(usage);
});

app.post("/api/usage", requireUser, async (req, res) => {
  const { gpt } = req.body;

  if (!gpt) return res.status(400).json({ error: "GPT required" });

  await db.query(
    `
    INSERT INTO usage (email, gpt, count, date)
    VALUES ($1, $2, 1, CURRENT_DATE)
    ON CONFLICT (email, gpt, date)
    DO UPDATE SET count = usage.count + 1
    `,
    [req.user.email, gpt]
  );

  res.json({ ok: true });
});

/* ---------- ADMIN: USERS ---------- */
app.get("/api/admin/users", requireAdmin, async (_, res) => {
  const r = await db.query(`
    SELECT email, role, plan, blocked, created_at
    FROM users
    ORDER BY created_at DESC
  `);

  res.json(r.rows);
});

app.post("/api/admin/users/action", requireAdmin, async (req, res) => {
  const { email, action, value } = req.body;

  switch (action) {
    case "block":
      await db.query(`UPDATE users SET blocked=TRUE WHERE email=$1`, [email]);
      break;

    case "unblock":
      await db.query(`UPDATE users SET blocked=FALSE WHERE email=$1`, [email]);
      break;

    case "delete":
      await db.query(`DELETE FROM users WHERE email=$1`, [email]);
      break;

    case "role":
      await db.query(`UPDATE users SET role=$2 WHERE email=$1`, [email, value]);
      break;

    case "plan":
      await db.query(`UPDATE users SET plan=$2 WHERE email=$1`, [email, value]);
      break;

    default:
      return res.status(400).json({ error: "Invalid action" });
  }

  res.json({ ok: true });
});

app.get("/api/admin/devices", requireAdmin, async (_, res) => {
  const r = await db.query(
    `SELECT email, device_id, last_seen, user_agent FROM user_devices`
  );
  res.json(r.rows);
});

// Revoke a device for logged-in user
app.post("/api/account/devices/revoke", requireUser, async (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: "deviceId required" });
  }

  await logAudit(req.user.email, "REVOKE_DEVICE", deviceId);

  // 1️⃣ Remove device
  await db.query(
    `DELETE FROM user_devices
     WHERE email=$1 AND device_id=$2`,
    [req.user.email, deviceId]
  );

  // 2️⃣ Invalidate ALL sessions
  await db.query(
    `UPDATE users
     SET token_version = token_version + 1
     WHERE email=$1`,
    [req.user.email]
  );

  res.json({ ok: true });
});

app.get("/api/admin/payments", requireAdmin, async (req, res) => {
  const r = await db.query(`
    SELECT payment_id, email, amount, plan, status, refund_id, created_at
    FROM payments
    ORDER BY created_at DESC
  `);
  res.json(r.rows);
});

app.post("/api/razorpay/verify", requireUser, async (req, res) => {
  const { payment_id, order_id } = req.body;

  const order = await razorpay.orders.fetch(order_id);

  const { email, plan } = order.notes;

  await db.query(
    `UPDATE users SET plan=$2 WHERE email=$1`,
    [email, plan]
  );

  await db.query(
  `INSERT INTO payments (payment_id,email,amount,plan,status)
   VALUES ($1,$2,$3,$4,'paid')`,
  [payment_id, email, order.amount / 100, plan]
);

  const user = await db.query(
  "SELECT email, role, plan, token_version FROM users WHERE email=$1",
  [email]
);

const newToken = jwt.sign(
  {
    email: user.rows[0].email,
    role: user.rows[0].role,
    plan: user.rows[0].plan,
    tv: user.rows[0].token_version,
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

res.cookie("auth", newToken, {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

await generateInvoice({
  paymentId: payment_id,
  email,
  amount: order.amount / 100,
  plan
});

await sendInvoiceEmail(email, payment_id);

return res.json({ ok: true });

  });

app.post("/api/admin/refund", requireAdmin, async (req, res) => {
  const { paymentId, amount } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: "paymentId required" });
  }

  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined, // partial or full
    });

    await logAudit(req.user.email, "REFUND", paymentId);

    await db.query(
      `
    UPDATE payments
    SET status='refunded',
        refund_id=$2
    WHERE payment_id=$1
    `,
      [paymentId, refund.id]
    );

    res.json({ ok: true, refund });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ error: "Refund failed" });
  }
});

app.get("/api/admin/audit-logs", requireAdmin, async (_, res) => {
  const r = await db.query(
    `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200`
  );
  res.json(r.rows);
});

app.get("/api/csrf", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get("/api/invoice/:id", requireUser, async (req, res) => {
  const { id } = req.params;

  const r = await db.query(
    "SELECT * FROM invoices WHERE id=$1 AND email=$2",
    [id, req.user.email]
  );

  if (!r.rows.length) return res.status(404).send("Not found");

  const invoice = r.rows[0];
  const pdfPath = path.join("/tmp", `${invoice.invoice_number}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    // If PDF not present, try regenerating (if generateInvoice supports it),
    // otherwise return 404 so client knows it's missing.
    console.warn("Invoice PDF missing for", invoice.invoice_number);
    return res.status(404).send("PDF not found");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.sendFile(pdfPath);
});

app.listen(3000, () =>
  console.log("✅ API running at http://localhost:3000")
);
