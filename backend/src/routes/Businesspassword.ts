import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import pool from "../db";

const router = Router();

const resend     = new Resend(process.env.RESEND_API_KEY);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const FROM       = "BarkBuddy <paws@barkbuddy.org.uk>";

const generateToken = () => crypto.randomBytes(32).toString("hex");

// POST /api/business/password/forgot
router.post("/forgot", [
  body("email").isEmail().normalizeEmail(),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Please enter a valid email address." });
    return;
  }

  const { email } = req.body;
  const SAFE_RESPONSE = { message: "If an approved account exists with that email, a reset link has been sent." };

  try {
    const { rows } = await pool.query(
      "SELECT id, personal_name, status FROM business_accounts WHERE email = $1 AND deleted_at IS NULL",
      [email]
    );

    if (rows.length === 0 || rows[0].status !== "approved") {
      res.json(SAFE_RESPONSE);
      return;
    }

    const biz = rows[0];

    // Invalidate existing tokens
    await pool.query(
      "UPDATE business_password_reset_tokens SET used = true WHERE business_id = $1 AND used = false",
      [biz.id]
    );

    const token     = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      "INSERT INTO business_password_reset_tokens (business_id, token, expires_at) VALUES ($1, $2, $3)",
      [biz.id, token, expiresAt]
    );

    const resetUrl = `${CLIENT_URL}/#/business/reset-password?token=${token}`;

    await resend.sendMail({
      from:    `"BarkBuddy for Business 🐾" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: "Reset your BarkBuddy Business password",
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f4f1fb;border-radius:12px;">
          <div style="background:linear-gradient(135deg,#2d1b69,#5b21b6);border-radius:10px;padding:28px 32px;margin-bottom:24px;text-align:center;">
            <div style="font-size:28px;margin-bottom:8px;">🐾</div>
            <h1 style="color:#ede9fe;font-size:20px;font-weight:400;margin:0;">Password Reset</h1>
            <p style="color:rgba(237,233,254,0.6);font-size:13px;margin:6px 0 0;">BarkBuddy for Business</p>
          </div>
          <p style="color:#1e1b4b;font-size:15px;margin:0 0 12px;">Hi <strong>${biz.personal_name}</strong>,</p>
          <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Click the button below to reset your password. This link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#5b21b6,#7c3aed);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 40px;border-radius:50px;">
              Reset My Password
            </a>
          </div>
          <p style="color:#6b7280;font-size:12px;word-break:break-all;margin:0 0 20px;">${resetUrl}</p>
          <p style="color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px;margin:0;">
            If you didn't request this, you can safely ignore it.
          </p>
        </div>
      `,
    });

    res.json(SAFE_RESPONSE);
  } catch (err) {
    console.error("Business forgot password error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ─── POST /api/business/password/reset ───────────────────────────────────────
router.post("/reset", [
  body("token").notEmpty(),
  body("password").isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
  body("confirmPassword").custom((v, { req }) => {
    if (v !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.array().reduce((acc: any, e: any) => { acc[e.path] = e.msg; return acc; }, {}),
    });
    return;
  }

  const { token, password } = req.body;

  try {
    const { rows } = await pool.query(
      `SELECT bprt.id, bprt.business_id
       FROM business_password_reset_tokens bprt
       WHERE bprt.token = $1 AND bprt.used = false AND bprt.expires_at > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      res.status(400).json({ message: "This reset link is invalid or has expired." });
      return;
    }

    const { id: tokenId, business_id } = rows[0];
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query("BEGIN");
    await pool.query(
      "UPDATE business_accounts SET password_hash = $1, must_change_password = false, updated_at = NOW() WHERE id = $2",
      [passwordHash, business_id]
    );
    await pool.query(
      "UPDATE business_password_reset_tokens SET used = true WHERE id = $1",
      [tokenId]
    );
    await pool.query("COMMIT");

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Business reset password error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── GET /api/business/password/verify-token ─────────────────────────────────
router.get("/verify-token", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query as { token: string };
  if (!token) { res.status(400).json({ valid: false }); return; }

  try {
    const { rows } = await pool.query(
      "SELECT id FROM business_password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()",
      [token]
    );
    res.json({ valid: rows.length > 0 });
  } catch {
    res.status(500).json({ valid: false });
  }
});

export default router;