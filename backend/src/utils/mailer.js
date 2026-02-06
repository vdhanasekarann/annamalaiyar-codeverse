import fs from "fs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(toEmail, pdfFilePath) {

  const fileBuffer = fs.readFileSync(pdfFilePath);
  const base64 = fileBuffer.toString("base64");

  return await resend.emails.send({
    from: "CodeVerse <hello@aicodeverse.com>",
    to: toEmail,
    subject: "🧾 Your Invoice – Annamalaiyar CodeVerse AI OS",
    html: `<p>Thank you for your purchase. Invoice attached.</p>`,
    attachments: [
      {
        type: "application/pdf",
        name: "invoice.pdf",
        data: base64,
      },
    ],
  });
}
