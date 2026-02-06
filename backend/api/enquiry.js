import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, projectType, budget, details } = req.body;

  if (!name || !email || !details) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = `
New Project Enquiry 🚀

Name: ${name}
Email: ${email}
Project Type: ${projectType}
Budget: ${budget}

Details:
${details}
    `;

    await transporter.sendMail({
      from: `"Annamalaiyar CodeVerse" <${process.env.SMTP_USER}>`,
      to: process.env.TO_EMAIL,
      subject: `New Enquiry from ${name}`,
      text: message,
    });

// ✉️ Auto-reply email to customer
await transporter.sendMail({
  from: `"Annamalaiyar CodeVerse" <${process.env.SMTP_USER}>`,
  to: email, // customer's email
  subject: "We received your enquiry – Annamalaiyar CodeVerse",
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hi ${name}, 👋</h2>

      <p>Thank you for reaching out to <strong>Annamalaiyar CodeVerse</strong>.</p>

      <p>We’ve received your project enquiry and our team will review it shortly.</p>

      <h3>📌 Your Submission</h3>
      <ul>
        <li><strong>Project Type:</strong> ${projectType}</li>
        <li><strong>Estimated Budget:</strong> ${budget || "Not specified"}</li>
      </ul>

      <p>
        We usually respond within <strong>24 hours</strong> with:
        <ul>
          <li>Project feasibility</li>
          <li>Estimated timeline</li>
          <li>Next steps</li>
        </ul>
      </p>

      <p>
        If your requirement is urgent, you can directly reply to this email or
        call us at <strong>+91-9600887711</strong>.
      </p>

      <br />

      <p>
        Regards,<br />
        <strong>Annamalaiyar CodeVerse</strong><br />
        Web • Mobile • Cloud • AI Solutions
      </p>
    </div>
  `,
});

    // 🔔 Telegram notification (optional)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
          }),
        }
      );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Enquiry error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
