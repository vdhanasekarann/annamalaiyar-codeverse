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
import { isExpectedPlanAmount, isValidPlan, planAmountPaise } from "./src/payments/plans.js";
import { ensureInvoiceAndEmail } from "./src/payments/invoiceEmail.js";
import { ensureInvoicePdf } from "./src/utils/invoice.js";
import { isPlanConstraintError, runWithPlanSchemaSync } from "./src/payments/planSchemaSync.js";
import { savePaidPayment } from "./src/payments/paymentWrite.js";
import csrf from "csurf";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Resend } from "resend";
import fs from "fs";
import os from "os";
import path from "path";
import nodemailer from "nodemailer";
import { Buffer } from "node:buffer";

async function logAudit(actor, action, target) {
  await db.query(
    `
    INSERT INTO audit_logs (id, actor_email, action, target)
    VALUES ($1,$2,$3,$4)
    `,
    [uuid(), actor, action, target]
  );
}

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

async function resolveUserPlanForToken(email, fallbackPlan = "free") {
  try {
    const paid = await db.query(
      `
      SELECT plan
      FROM payments
      WHERE email=$1 AND status='paid'
      ORDER BY created_at DESC NULLS LAST
      LIMIT 1
      `,
      [email]
    );
    const paidPlan = paid.rows[0]?.plan;
    if (isValidPlan(paidPlan)) {
      return paidPlan;
    }
  } catch {
    // Non-fatal: older DBs may have partial schema differences.
  }

  return isValidPlan(fallbackPlan) ? fallbackPlan : "free";
}

const app = express();
app.set("trust proxy", "loopback");
app.use(cookieParser());

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  "ionic://localhost",
  "https://app.aicodeverse.com",
  "https://aicodeverse.com",
  "https://www.aicodeverse.com",
]);

app.use(cors({
  origin(origin, callback) {
    // Native mobile apps / tooling may send no Origin header.
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "x-device-id"
  ]
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(helmet());

const resend = new Resend(process.env.RESEND_API_KEY);
const IS_PROD = process.env.NODE_ENV === "production";
const AUTH_COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || (IS_PROD ? ".aicodeverse.com" : undefined);

function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: IS_PROD ? "none" : "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(AUTH_COOKIE_DOMAIN ? { domain: AUTH_COOKIE_DOMAIN } : {}),
  };
}

function setAuthCookie(res, token) {
  res.cookie("auth", token, authCookieOptions());
}

function clearAuthCookie(res) {
  const baseOptions = {
    httpOnly: true,
    sameSite: IS_PROD ? "none" : "lax",
    secure: IS_PROD,
    path: "/",
  };

  // Clear host-only cookie variant
  res.clearCookie("auth", baseOptions);

  // Clear domain cookie variant (if configured)
  if (AUTH_COOKIE_DOMAIN) {
    res.clearCookie("auth", { ...baseOptions, domain: AUTH_COOKIE_DOMAIN });

    // Also clear non-dotted domain variant to handle older deployments.
    if (AUTH_COOKIE_DOMAIN.startsWith(".")) {
      res.clearCookie("auth", {
        ...baseOptions,
        domain: AUTH_COOKIE_DOMAIN.slice(1),
      });
    }
  }
}

function normalizeEmail(rawEmail) {
  return String(rawEmail || "").trim().toLowerCase();
}

async function upsertUserByEmail(email) {
  await db.query(
    `
    INSERT INTO users (email, role, plan, token_version, blocked)
    VALUES ($1, 'user', 'free', 0, FALSE)
    ON CONFLICT (email) DO NOTHING
    `,
    [email]
  );
}

function buildAuthToken({ email, role, plan, tokenVersion }) {
  return jwt.sign(
    {
      email,
      role,
      plan,
      tv: tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

const csrfProtection = csrf({ cookie: true });

// NOTE: make sure you don't register the razorpay webhook twice.
// (We removed any prior shorthand registration; the explicit handler is included below.)

app.use("/api/admin", csrfProtection);
app.use("/api/account", (req, res, next) => {
  if (req.method === "GET") return next();
  csrfProtection(req, res, next);
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth check only (NO device)
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json(req.user);
});

app.post(
  "/api/razorpay/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.post("/api/account/devices/register", requireUser, async (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId)
    return res.status(400).json({ error: "deviceId required" });

  await db.query(
    `
    INSERT INTO user_devices (email, device_id, user_agent, last_seen)
    VALUES ($1,$2,$3,NOW())
    ON CONFLICT (email, device_id)
    DO UPDATE SET last_seen = NOW()
    `,
    [req.user.email, deviceId, req.headers["user-agent"]]
  );

  res.json({ ok: true });
});

app.post("/api/create-order", csrfProtection, paymentRateLimiter, requireUser, async (req, res) => {
  try {
    const { plan } = req.body || {};
    const email = req.user?.email;

    if (!plan || !email) {
      return res.status(400).json({ error: "Missing plan or email" });
    }

    if (!isValidPlan(plan)) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const amount = planAmountPaise(plan);
    if (!amount) {
      return res.status(400).json({ error: "Invalid plan amount" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `cv_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
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
app.post("/api/auth/login", authRateLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: "Email required" });

    await logAudit(email, "LOGIN", "self");
    await upsertUserByEmail(email);

    const r = await db.query(
      "SELECT email, role, plan, token_version FROM users WHERE email=$1",
      [email]
    );

    if (!r.rows.length) {
      return res.status(404).json({ error: "User record not found" });
    }

    const user = r.rows[0];
    const tokenPlan = await resolveUserPlanForToken(user.email, user.plan);

    const token = buildAuthToken({
      email: user.email,
      role: user.role || "user",
      plan: tokenPlan,
      tokenVersion: Number(user.token_version ?? 0),
    });

    setAuthCookie(res, token);

    res.json({
      ok: true,
      token,
      user: {
        email: user.email,
        role: user.role || "user",
        plan: tokenPlan,
      },
    });
  } catch (err) {
    console.error("Email login failed:", err);
    return res.status(500).json({ error: "Unable to login right now. Please try again." });
  }
});

app.post("/api/auth/logout", (_, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function parseCsvEnv(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function getAllowedGoogleAudiences() {
  const set = new Set();
  const candidates = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_IDS,
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
  ];

  for (const candidate of candidates) {
    for (const value of parseCsvEnv(candidate)) {
      set.add(value);
    }
  }

  return [...set];
}

async function verifyGoogleCredential(credential) {
  const audiences = getAllowedGoogleAudiences();
  let ticket = null;
  let usedAudienceFallback = false;

  try {
    const verifyOptions = { idToken: credential };
    if (audiences.length) {
      verifyOptions.audience = audiences;
    }
    ticket = await googleClient.verifyIdToken(verifyOptions);
  } catch (primaryErr) {
    try {
      ticket = await googleClient.verifyIdToken({ idToken: credential });
      usedAudienceFallback = true;
    } catch (fallbackErr) {
      const err = new Error("GOOGLE_VERIFY_FAILED");
      err.meta = {
        primary: primaryErr?.message,
        fallback: fallbackErr?.message,
        audiencesConfigured: audiences.length,
      };
      throw err;
    }
  }

  const payload = ticket.getPayload() || {};
  if (payload.email_verified === false) {
    const err = new Error("GOOGLE_EMAIL_NOT_VERIFIED");
    throw err;
  }

  const tokenAudience = String(payload.aud || "");
  const audienceMatched = !audiences.length || audiences.includes(tokenAudience);
  const strictAudience = String(process.env.GOOGLE_STRICT_AUDIENCE || "").toLowerCase() === "true";

  if (!audienceMatched && strictAudience) {
    const err = new Error("GOOGLE_AUDIENCE_MISMATCH");
    err.meta = { tokenAudience, audiencesConfigured: audiences };
    throw err;
  }

  if (!audienceMatched) {
    console.warn("Google OAuth audience mismatch accepted:", {
      tokenAudience,
      audiencesConfigured: audiences,
      usedAudienceFallback,
    });
  }

  const email = normalizeEmail(payload.email);
  if (!email) {
    const err = new Error("GOOGLE_EMAIL_MISSING");
    throw err;
  }

  return { email, payload };
}

async function issueSessionForEmail(email) {
  await upsertUserByEmail(email);

  const r = await db.query(
    "SELECT email, role, plan, token_version FROM users WHERE email=$1",
    [email]
  );

  if (!r.rows.length) {
    const err = new Error("USER_NOT_FOUND");
    throw err;
  }

  const user = r.rows[0];
  const tokenPlan = await resolveUserPlanForToken(user.email, user.plan);

  const token = buildAuthToken({
    email: user.email,
    role: user.role || "user",
    plan: tokenPlan,
    tokenVersion: Number(user.token_version ?? 0),
  });

  return {
    token,
    user: {
      email: user.email,
      role: user.role || "user",
      plan: tokenPlan,
    },
  };
}

app.post("/api/auth/google", authRateLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing credential" });
    }
    const { email } = await verifyGoogleCredential(credential);
    const session = await issueSessionForEmail(email);

    setAuthCookie(res, session.token);

    res.json({
      ok: true,
      token: session.token,
      user: session.user,
    });
  } catch (err) {
    console.error("Google OAuth error:", err?.meta || err?.message || err);
    if (err?.message === "GOOGLE_EMAIL_NOT_VERIFIED") {
      return res.status(401).json({ error: "Google account email is not verified" });
    }
    if (err?.message === "GOOGLE_EMAIL_MISSING") {
      return res.status(400).json({ error: "Google account email not available" });
    }
    if (err?.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "User record not found" });
    }
    res.status(401).json({ error: "Google authentication failed" });
  }
});

app.post("/api/auth/google-redirect", authRateLimiter, async (req, res) => {
  try {
    const credential = String(req.body?.credential || "");
    if (!credential) {
      return res.status(400).send("Missing credential");
    }

    const { email } = await verifyGoogleCredential(credential);
    const session = await issueSessionForEmail(email);
    setAuthCookie(res, session.token);

    const params = new URLSearchParams({
      token: session.token,
      email: session.user.email,
    });

    const deepLink = `com.aicodeverse.app://auth/callback?${params.toString()}`;
    const webFallback = `${process.env.FRONTEND_URL}/auth/callback?${params.toString()}`;

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Returning to App...</title>
  </head>
  <body style="font-family: Arial, sans-serif; padding: 24px;">
    <h2>Signing you in...</h2>
    <p>Returning to CodeVerse app.</p>
    <p><a href="${deepLink}">Tap here if app does not open automatically</a></p>
    <script>
      (function() {
        var deepLink = ${JSON.stringify(deepLink)};
        var webFallback = ${JSON.stringify(webFallback)};
        window.location.replace(deepLink);
        setTimeout(function() {
          window.location.replace(webFallback);
        }, 1200);
      })();
    </script>
  </body>
</html>`;

    res.status(200).set("Content-Type", "text/html; charset=utf-8").send(html);
  } catch (err) {
    console.error("Google redirect OAuth error:", err?.meta || err?.message || err);
    res.status(401).send("Google authentication failed");
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

app.post("/api/auth/magic-link", authRateLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");

    await db.query(
      `INSERT INTO magic_links (id, email, token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')`,
      [uuid(), email, hash]
    );

    // const link = `http://localhost:5173/magic-login?token=${token}`; //
    const link = `${process.env.FRONTEND_URL}/magic-login?token=${token}`;

    // 1) Try Resend
    try {
      const resp = await resend.emails.send({
        from: "CodeVerse <hello@aicodeverse.com>",
        to: email,
        subject: "Your secure login link – CodeVerse AI OS",
        html: `<div style="font-family:Arial;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
  <div style="text-align:center">
    <img src="https://app.aicodeverse.com/AICodeverse.png" style="width:120px;margin-bottom:20px" />
    <h2>Secure Login – CodeVerse AI OS</h2>
  </div>

  <p>Hello,</p>

  <p>You requested a secure login to <b>CodeVerse AI OS</b>.</p>

  <div style="text-align:center;margin:25px 0">
    <a href="${link}"
       style="background:#4f46e5;color:white;padding:12px 20px;border-radius:8px;text-decoration:none">
      Login to Dashboard
    </a>
  </div>

  <p>This link will expire in <b>15 minutes</b>.</p>

  <p style="opacity:0.7">If you did not request this, please ignore.</p>

  <hr />

  <p style="font-size:12px;opacity:0.6">
    CodeVerse AI OS – Secure Authentication System
  </p>
</div>`,
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

  const { email: rawEmail, id } = r.rows[0];
  const email = normalizeEmail(rawEmail);
  if (!email) return res.status(400).send("Invalid email");

  await db.query(`UPDATE magic_links SET used=TRUE WHERE id=$1`, [id]);

  await upsertUserByEmail(email);

  const u = await db.query(
    "SELECT email, role, plan, token_version FROM users WHERE email=$1",
    [email]
  );

  const user = u.rows[0];
  const tokenPlan = await resolveUserPlanForToken(user.email, user.plan);

  const jwtToken = buildAuthToken({
    email: user.email,
    role: user.role || "user",
    plan: tokenPlan,
    tokenVersion: Number(user.token_version ?? 0),
  });

  setAuthCookie(res, jwtToken);

  if (req.query?.format === "json") {
    return res.json({
      ok: true,
      token: jwtToken,
      user: {
        email: user.email,
        role: user.role || "user",
        plan: tokenPlan,
      },
    });
  }

  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});

/* ---------- ADMIN: REVENUE (AUTO CALCULATED) ---------- */
app.get("/api/admin/revenue", requireAdmin, async (req, res) => {
  const r = await db.query(`
    SELECT
      plan,
      COUNT(DISTINCT email)::int AS users,
      COALESCE(SUM(amount), 0)::numeric AS revenue
    FROM payments
    WHERE status='paid'
    GROUP BY plan
    ORDER BY revenue DESC
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

app.post("/api/razorpay/verify", csrfProtection, paymentRateLimiter, requireUser, async (req, res) => {
  const traceId = crypto.randomUUID();
  try {
    const { payment_id, order_id, razorpay_signature } = req.body || {};

    if (!payment_id || !order_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Razorpay secret is not configured" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    if (!timingSafeEqualHex(razorpay_signature, expectedSignature)) {
      return res.status(401).json({ error: "Invalid payment signature" });
    }

    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(order_id),
      razorpay.payments.fetch(payment_id),
    ]);

    if (!order || !payment) {
      return res.status(400).json({ error: "Payment lookup failed" });
    }

    if (payment.order_id !== order_id) {
      return res.status(400).json({ error: "Order and payment mismatch" });
    }

    if (payment.status !== "captured") {
      return res.status(400).json({ error: "Payment not captured" });
    }

    const { email, plan } = order.notes || {};
    if (!email || !isValidPlan(plan)) {
      return res.status(400).json({ error: "Invalid order notes" });
    }

    if (email !== req.user.email) {
      return res.status(403).json({ error: "Order does not belong to current user" });
    }

    if (!isExpectedPlanAmount(plan, order.amount)) {
      return res.status(400).json({ error: "Order amount does not match plan" });
    }

    if (Number(payment.amount) !== Number(order.amount)) {
      return res.status(400).json({ error: "Payment amount mismatch" });
    }

    const persistence = {
      paymentRecorded: false,
      userPlanStored: false,
      invoiceEmailed: false,
      invoiceEmailError: null,
    };

    try {
      await runWithPlanSchemaSync(plan, async () => {
        const saved = await savePaidPayment({
          paymentId: payment_id,
          email,
          amount: order.amount / 100,
          plan,
        });
        persistence.paymentRecorded = Boolean(saved.inserted);
      });
    } catch (paymentErr) {
      console.warn(`[verify:${traceId}] payment persistence failed`, {
        paymentId: payment_id,
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
      console.warn(`[verify:${traceId}] user plan update failed`, {
        email,
        plan,
        code: userPlanErr?.code,
        error: userPlanErr?.message || String(userPlanErr),
      });
    }

    try {
      const invoiceResult = await ensureInvoiceAndEmail({
        paymentId: payment_id,
        email,
        amount: order.amount / 100,
        plan,
      });
      persistence.invoiceEmailed = Boolean(
        invoiceResult?.emailed || invoiceResult?.skipped === "already_sent"
      );
    } catch (invoiceErr) {
      const invoiceErrMsg = invoiceErr?.message || String(invoiceErr);
      console.error("Invoice/email failed after payment verify", {
        paymentId: payment_id,
        error: invoiceErrMsg,
      });
      persistence.invoiceEmailError = "delivery_pending";
    }

    const newToken = jwt.sign(
      {
        email,
        role: req.user.role || "user",
        plan,
        tv: Number(req.user.tv ?? 0),
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setAuthCookie(res, newToken);
    return res.json({ ok: true, plan, traceId, ...persistence });
  } catch (err) {
    if (isPlanConstraintError(err)) {
      console.error(`[verify:${traceId}] Razorpay verify plan schema mismatch:`, err);
      return res.status(409).json({
        error: "Database plan schema does not allow this plan yet. Add plan value and retry verification.",
        traceId,
      });
    }
    console.error(`[verify:${traceId}] Razorpay verify failed:`, err);
    return res.status(500).json({ error: "Payment verification failed", traceId });
  }
});

app.post("/api/admin/refund", requireAdmin, async (req, res) => {
  const { paymentId, amount } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: "paymentId required" });
  }

  try {
    let refund;

    if (amount) {
      refund = await razorpay.payments.refund(paymentId, {
        amount: amount * 100
      });
    } else {
      refund = await razorpay.payments.refund(paymentId);
    }

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
  console.log("Refund request:", paymentId, amount);
console.log("Payment record:", await db.query(
  "SELECT * FROM payments WHERE payment_id=$1",
  [paymentId]
));
  res.status(500).json({
    error: err?.error?.description || "Refund failed"
  });
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
  let pdfPath = path.join(os.tmpdir(), `${invoice.invoice_number}.pdf`);
  if (!fs.existsSync(pdfPath)) {
    try {
      pdfPath = await ensureInvoicePdf({
        invoiceNo: invoice.invoice_number,
        paymentId: invoice.payment_id,
        email: invoice.email || req.user.email,
        amount: invoice.amount,
        plan: invoice.plan,
      });
    } catch (pdfErr) {
      console.warn("Invoice PDF regeneration failed for", invoice.invoice_number, pdfErr);
      return res.status(404).send("PDF not found");
    }
  }

  res.setHeader("Content-Type", "application/pdf");
  res.sendFile(pdfPath);
});

app.post("/api/reviews", requireUser, async (req, res) => {
  const { gpt, rating, review } = req.body;

  await db.query(
    `INSERT INTO gpt_reviews (id,gpt,email,rating,review)
     VALUES ($1,$2,$3,$4,$5)`,
    [uuid(), gpt, req.user.email, rating, review]
  );

  res.json({ ok: true });
});

app.get("/api/reviews/:gpt", async (req, res) => {
  const r = await db.query(
    `SELECT id, rating, review, email
     FROM gpt_reviews
     WHERE gpt=$1`,
    [req.params.gpt]
  );

  res.json(r.rows);
});

app.post("/api/inbound-email", express.json(), async (req,res)=>{
  console.log("Incoming email:", req.body);

  const { from, subject, text, html } = req.body;

  // Save email to database
  await db.collection("emails").insertOne({
    from,
    subject,
    text,
    html,
    receivedAt: new Date()
  });

  res.status(200).send("ok");
});

app.use((err, req, res, next) => {
  if (err?.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  return next(err);
});

app.listen(3000, () => {
  console.log("✅ API running at http://localhost:3000");
});

