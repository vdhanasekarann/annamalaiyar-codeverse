import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { Resend } from "resend";

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createSmtpTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || "587"),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendViaResend({ toEmail, subject, html, base64Pdf, filename }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY missing");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.RESEND_FROM ||
    process.env.FROM_EMAIL ||
    "CodeVerse <hello@aicodeverse.com>";

  const resp = await resend.emails.send({
    from,
    to: toEmail,
    subject,
    html,
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
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

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
  const subject = "Your Invoice - Annamalaiyar CodeVerse AI OS";
  const html = "<p>Thank you for your purchase. Your invoice is attached.</p>";

  let lastError = null;

  try {
    return await sendViaResend({
      toEmail,
      subject,
      html,
      base64Pdf,
      filename,
    });
  } catch (err) {
    lastError = err;
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
    lastError = err;
    console.warn("Invoice email via SMTP failed:", err?.message || String(err));
  }

  throw lastError || new Error("No email provider is configured");
}
