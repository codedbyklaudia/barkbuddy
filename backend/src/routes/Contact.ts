import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";

const router = Router();

const CONTACT_TO = "paws@barkbuddy.org.uk";

// Gmail transporter 
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// POST /api/contact
router.post("/", async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({ message: "Message is too short." });
  }

  try {
    // Email to BarkBuddy inbox 
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to:       CONTACT_TO,
      replyTo:  email,
      subject:  `[BarkBuddy] ${subject ?? "New message"} — from ${name}`,
      html: `
        <div style="font-family: Marcellus, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #3A2F51; border-radius: 12px;">
          <div style="background: #3a2f51; border-radius: 10px; padding: 28px 32px; margin-bottom: 28px;">
            <h1 style="font-size: 22px; color: #f7f7f7; margin: 0; font-weight: normal; letter-spacing: 0.03em;">
              New message from contact form!
            </h1>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #3a2f51; width: 110px;">
                <span style="font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #f7f7f7;">From:</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #3a2f51; font-size: 15px; color: #f7f7f7;">
                ${name}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #3a2f51;">
                <span style="font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #f7f7f7;">Email</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #3a2f51; font-size: 15px; color: #f7f7f7;">
                <a href="mailto:${email}" style="color: #f7f7f7; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0;">
                <span style="font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #f7f7f7;">Subject</span>
              </td>
              <td style="padding: 10px 0; font-size: 15px; color: #f7f7f7;">
                ${subject ?? "General question"}
              </td>
            </tr>
          </table>

          <div style="background: #fff; border: 1px solid #e8e5f0; border-radius: 8px; padding: 24px;">
            <p style="font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #8b7fb3; margin: 0 0 12px;">Message</p>
            <p style="font-size: 15px; color: #2d1f5e; line-height: 1.75; margin: 0; white-space: pre-wrap;">${message.trim()}</p>
          </div>

          <p style="font-size: 12px; color: #b0a8cc; margin-top: 24px; text-align: center;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    // Auto-reply to the sender
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to:      email,
      subject: "We received your message 🐾",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f8fc; border-radius: 12px;">
          <div style="background: #3b2d6e; border-radius: 10px; padding: 28px 32px; margin-bottom: 28px;">
            <h1 style="font-size: 22px; color: #f9f8fc; margin: 0; font-weight: normal; letter-spacing: 0.03em;">
              Thanks for reaching out, ${name}! 🐾
            </h1>
          </div>

          <p style="font-size: 15px; color: #2d1f5e; line-height: 1.8; margin: 0 0 16px;">
            We've received your message and will get back to you within <strong>48 hours</strong>.
          </p>

          <p style="font-size: 15px; color: #2d1f5e; line-height: 1.8; margin: 0 0 28px;">
            In the meantime, feel free to explore BarkBuddy — and give your bark buddy an extra treat from us. 🐶
          </p>

          <div style="background: #fff; border: 1px solid #e8e5f0; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px;">
            <p style="font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #8b7fb3; margin: 0 0 8px;">Your message</p>
            <p style="font-size: 14px; color: #6b6280; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message.trim()}</p>
          </div>

          <p style="font-size: 13px; color: #b0a8cc; text-align: center; margin: 0;">
            — Klaudia &amp; the BarkBuddy team
          </p>
        </div>
      `,
    });

    return res.status(200).json({ message: "Message sent successfully." });

  } catch (err) {
    console.error("Contact form email error:", err);
    return res.status(500).json({ message: "Failed to send message. Please email us directly at paws@barkbuddy.org.uk" });
  }
});

export default router;