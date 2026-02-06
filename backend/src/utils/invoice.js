import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import os from "os";
import { db } from "../../api/_db.js";

export async function generateInvoice({ paymentId, email, amount, plan }) {

  const invoiceNo = "ACV-" + Date.now();
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `${invoiceNo}.pdf`);

  const subtotal = amount;

  const enableGST = subtotal >= 20000;
  const gstRate = enableGST ? 18 : 0;

  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const total = subtotal + gstAmount;

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

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
  doc.text(`Subtotal: ₹${subtotal}`);
  doc.text(`GST (${gstRate}%): ₹${gstAmount}`);
  doc.text(`TOTAL: ₹${total}`);

  doc.text("-----------------------------------------------------");

  doc.moveDown();
  doc.text("This is a computer generated invoice.");
  doc.end();

  const pdfUrl = `/invoices/${invoiceNo}.pdf`;

  await db.query(
    `INSERT INTO invoices 
     (payment_id,email,plan,amount,invoice_number,pdf_url)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [paymentId, email, plan, total, invoiceNo, pdfUrl]
  );

  return { invoiceNo, pdfUrl, pdfPath: filePath };
}
