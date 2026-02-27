import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import pool from "../db";

const router = Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ─── Gmail transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

// ─── Helper: generate secure token ───────────────────────────────────────────
const generateToken = () => crypto.randomBytes(32).toString("hex");

// ─── POST /api/password/forgot ────────────────────────────────────────────────
router.post("/forgot", [
  body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Please enter a valid email address" });
    return;
  }

  const { email } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );

    // Always return success — prevents user enumeration
    if (userResult.rows.length === 0) {
      res.json({ message: "If an account exists, a reset link has been sent." });
      return;
    }

    const user = userResult.rows[0];

    // Invalidate any existing unused tokens
    await pool.query(
      "UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false",
      [user.id]
    );

    // Generate token — expires in 1 hour
    const token     = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    const resetUrl = `${CLIENT_URL}/#/reset-password?token=${token}`;

    // Send email via Gmail
    await transporter.sendMail({
      from:    `"BarkBuddy 🐾" <${process.env.GMAIL_USER}>`,
      to:      user.email,
      subject: "Reset your BarkBuddy password 🐾",
      html:    generateResetEmailHtml(user.name, resetUrl),
    });

    res.json({ message: "If an account exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ─── POST /api/password/reset ─────────────────────────────────────────────────
router.post("/reset", [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Must contain a number"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors:  errors.array().reduce((acc: Record<string, string>, err: any) => {
        acc[err.path] = err.msg;
        return acc;
      }, {}),
    });
    return;
  }

  const { token, password } = req.body;

  try {
    const tokenResult = await pool.query(
      `SELECT prt.id, prt.user_id, u.email
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = $1
         AND prt.used = false
         AND prt.expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
      return;
    }

    const { id: tokenId, user_id: userId } = tokenResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query("BEGIN");
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, userId]
    );
    await pool.query(
      "UPDATE password_reset_tokens SET used = true WHERE id = $1",
      [tokenId]
    );
    await pool.query("COMMIT");

    res.json({ message: "Password reset successfully! You can now log in." });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ─── GET /api/password/verify-token ──────────────────────────────────────────
router.get("/verify-token", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query as { token: string };

  if (!token) {
    res.status(400).json({ valid: false });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id FROM password_reset_tokens
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );
    res.json({ valid: result.rows.length > 0 });
  } catch {
    res.status(500).json({ valid: false });
  }
});

// ─── Email HTML template ──────────────────────────────────────────────────────
const generateResetEmailHtml = (name: string, resetUrl: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f1fb;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1fb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(91,33,182,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#2d1b69 0%,#5b21b6 100%);padding:36px 40px;text-align:center;">
              <div style="font-size:28px;margin-bottom:8px;">🐾</div>
              <h1 style="color:#ede9fe;font-size:22px;font-weight:400;letter-spacing:0.04em;margin:0;">BarkBuddy</h1>
              <p style="color:rgba(237,233,254,0.7);font-size:13px;margin:6px 0 0;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="color:#1e1b4b;font-size:15px;margin:0 0 12px;">Hi <strong>${name}</strong>,</p>
              <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 24px;">
                We received a request to reset the password for your BarkBuddy account.
                Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 28px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#5b21b6,#7c3aed);color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:14px 36px;border-radius:50px;letter-spacing:0.03em;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#6b7280;font-size:12px;line-height:1.5;margin:0 0 8px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="background:#f4f1fb;border-radius:8px;padding:10px 14px;font-size:11px;color:#5b21b6;word-break:break-all;margin:0 0 24px;">
                ${resetUrl}
              </p>
              <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0;border-top:1px solid #f3f4f6;padding-top:20px;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
              <p style="color:#9ca3af;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} BarkBuddy · Made with 🐾 for dog lovers
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default router;