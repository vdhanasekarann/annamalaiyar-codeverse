import fs from "fs";
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import { db } from "../../api/_db.js";

function buildTotals(amount) {
  const subtotal = Number(amount || 0);
  const enableGST = subtotal >= 20000;
  const gstRate = enableGST ? 18 : 0;
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const total = subtotal + gstAmount;
  return { subtotal, gstRate, gstAmount, total };
}

function renderInvoicePdf({ invoiceNo, paymentId, email, plan, amount }) {
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `${invoiceNo}.pdf`);
  const { subtotal, gstRate, gstAmount, total } = buildTotals(amount);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    stream.on("finish", () => resolve({ filePath, total }));
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);

    doc.fontSize(20).text("ANNAMALAIYAR CODEVERSE AI OS", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoiceNo}`);
    doc.text(`Payment ID: ${paymentId}`);
    doc.text(`Customer Email: ${email}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown();
    doc.text("-----------------------------------------------------");
    doc.text(`Plan: ${plan}`);
    doc.text(`Subtotal: INR ${subtotal}`);
    doc.text(`GST (${gstRate}%): INR ${gstAmount}`);
    doc.text(`TOTAL: INR ${total}`);
    doc.text("-----------------------------------------------------");
    doc.moveDown();
    doc.text("This is a computer generated invoice.");
    doc.end();
  });
}

export async function ensureInvoicePdf({ invoiceNo, paymentId, email, amount, plan }) {
  const filePath = path.join(os.tmpdir(), `${invoiceNo}.pdf`);
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  const rendered = await renderInvoicePdf({
    invoiceNo,
    paymentId,
    email,
    plan,
    amount,
  });
  return rendered.filePath;
}

export async function generateInvoice({ paymentId, email, amount, plan }) {
  const invoiceNo = `ACV-${Date.now()}`;
  const rendered = await renderInvoicePdf({
    invoiceNo,
    paymentId,
    email,
    plan,
    amount,
  });

  const pdfUrl = `/invoices/${invoiceNo}.pdf`;

  await db.query(
    `INSERT INTO invoices
     (payment_id,email,plan,amount,invoice_number,pdf_url)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [paymentId, email, plan, rendered.total, invoiceNo, pdfUrl]
  );

  return { invoiceNo, pdfUrl, pdfPath: rendered.filePath };
}
