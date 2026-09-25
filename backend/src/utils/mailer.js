import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const RESEND_DEFAULT_FROM = "CodeVerse <onboarding@resend.dev>";

function smtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createSmtpTransport() {
  const port = Number(process.env.SMTP_PORT || "587");
  const hasSecureOverride = typeof process.env.SMTP_SECURE === "string";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: hasSecureOverride
      ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
      : port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function resolveResendFrom() {
  const configured = String(process.env.RESEND_FROM || "").trim();
  return configured || RESEND_DEFAULT_FROM;
}

function resolveReplyTo() {
  return process.env.FROM_EMAIL || process.env.SMTP_USER || undefined;
}

async function sendViaResend({ toEmail, subject, html, base64Pdf, filename }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY missing");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const resp = await resend.emails.send({
    from: resolveResendFrom(),
    to: toEmail,
    subject,
    html,
    ...(resolveReplyTo() ? { reply_to: resolveReplyTo() } : {}),
    attachments: [
      {
        filename,
        content: base64Pdf,
      },
    ],
  });

  if (resp?.error) {
    throw new Error(
      typeof resp.error === "string"
        ? resp.error
        : resp.error?.message || "Resend send failed"
    );
  }

  return { provider: "resend", id: resp?.id || null };
}

async function sendViaSmtp({ toEmail, subject, html, fileBuffer, filename }) {
  if (!smtpConfigured()) {
    throw new Error("SMTP not configured");
  }

  const transporter = createSmtpTransport();
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER || RESEND_DEFAULT_FROM;

  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    html,
    attachments: [
      {
        filename,
        content: fileBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return { provider: "smtp", id: info?.messageId || null };
}

export async function sendInvoiceEmail(toEmail, pdfFilePath) {
  if (!toEmail) {
    throw new Error("Recipient email is required");
  }
  if (!pdfFilePath || !fs.existsSync(pdfFilePath)) {
    throw new Error(`Invoice PDF not found at ${pdfFilePath || "<empty path>"}`);
  }

  const filename = path.basename(pdfFilePath) || "invoice.pdf";
  const fileBuffer = fs.readFileSync(pdfFilePath);
  const base64Pdf = fileBuffer.toString("base64");
  const subject = "Your Invoice - CodeVerse AI";
  const html = "<p>Thank you for your purchase. Your invoice is attached.</p>";

  const providerErrors = [];

  try {
    return await sendViaResend({
      toEmail,
      subject,
      html,
      base64Pdf,
      filename,
    });
  } catch (err) {
    providerErrors.push(`resend: ${err?.message || String(err)}`);
    console.warn("Invoice email via Resend failed:", err?.message || String(err));
  }

  try {
    return await sendViaSmtp({
      toEmail,
      subject,
      html,
      fileBuffer,
      filename,
    });
  } catch (err) {
    providerErrors.push(`smtp: ${err?.message || String(err)}`);
    console.warn("Invoice email via SMTP failed:", err?.message || String(err));
  }

  throw new Error(
    providerErrors.length
      ? `Invoice email send failed (${providerErrors.join(" | ")})`
      : "No email provider is configured"
  );
}
