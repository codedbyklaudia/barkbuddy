import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import pool from "../db";
import { signToken } from "../utils/jwt";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// ─── Resend Client ────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Email Verification Store ─────────────────────────────────────────────────
const pendingCodes = new Map<string, { code: string; expiresAt: number }>();
const CODE_TTL_MS  = 10 * 60 * 1000; // 10 minutes

function generateCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

// ─── Validation Rules ─────────────────────────────────────────────────────────
const registerValidation = [
  body("email")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
  body("dogName")
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("Dog name is required"),
  body("breed")
    .trim()
    .isLength({ min: 1 }).withMessage("Please select a breed"),
  body("lifeStage")
    .isIn(["puppy", "adult", "senior"]).withMessage("Please select a life stage"),
  body("personality")
    .isArray({ min: 1 }).withMessage("Please select at least one personality trait"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ─── POST /api/auth/send-verification ────────────────────────────────────────
router.post("/send-verification", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ message: "A valid email is required." });
    return;
  }

  const code      = generateCode();
  const expiresAt = Date.now() + CODE_TTL_MS;

  pendingCodes.set(email.toLowerCase(), { code, expiresAt });

  try {
    await resend.emails.send({
      from:    "BarkBuddy <paws@barkbuddy.org.uk>",
      to:      email,
      subject: "Your BarkBuddy verification code",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="color: #4c2d6e; margin-bottom: 8px;">Verify your email 🐾</h2>
          <p style="color: #6b5b7b; margin-bottom: 24px;">
            Use the code below to verify your email address. It expires in 10 minutes.
          </p>
          <div style="
            background: #f3eeff;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            letter-spacing: 0.3em;
            font-size: 2.2rem;
            font-weight: 700;
            color: #4c2d6e;
            margin-bottom: 24px;
          ">${code}</div>
          <p style="color: #9b7ab5; font-size: 0.85rem;">
            If you didn't create a BarkBuddy account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    res.status(200).json({ message: "Verification email sent." });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ message: "Failed to send the verification email. Please try again." });
  }
});

// ─── POST /api/auth/verify-code ──────────────────────────────────────────────
router.post("/verify-code", (req: Request, res: Response): void => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ message: "Email and code are required." });
    return;
  }

  const record = pendingCodes.get(email.toLowerCase());

  if (!record) {
    res.status(400).json({
      valid: false,
      message: "No verification code found for this email. Please request a new one.",
    });
    return;
  }

  if (Date.now() > record.expiresAt) {
    pendingCodes.delete(email.toLowerCase());
    res.status(400).json({
      valid: false,
      message: "Your code has expired. Please request a new one.",
    });
    return;
  }

  const expected = Buffer.from(record.code);
  const received = Buffer.from(code);
  const valid    =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (valid) {
    pendingCodes.delete(email.toLowerCase());
  }

  res.status(200).json({ valid });
});

//Check if email exist
router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ exists: false });

  const result = await pool.query(
    "SELECT 1 FROM users WHERE email = $1 LIMIT 1",
    [email.toLowerCase().trim()]
  );

  res.json({ exists: result.rowCount > 0 });
});

// POST /api/auth/register
router.post("/register", registerValidation, async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.array().reduce((acc: Record<string, string>, err: any) => {
        acc[err.path] = err.msg;
        return acc;
      }, {}),
    });
    return;
  }

  const {
    email, name, password,
    dogName, dogGender, breed, dogDob, lifeStage, personality,
  } = req.body;

  const client = await pool.connect();

  try {
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({
        message: "Validation failed",
        errors: { email: "An account with this email already exists" },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, profile_complete, created_at`,
      [name, email, passwordHash]
    );
    const user = userResult.rows[0];

    const dogResult = await client.query(
      `INSERT INTO dogs (user_id, name, gender, breed, dob, life_stage, personality)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, gender, breed, dob, life_stage, personality`,
      [
        user.id,
        dogName,
        dogGender || null,
        breed,
        dogDob || null,
        lifeStage,
        personality,
      ]
    );
    const dog = dogResult.rows[0];

    await client.query("COMMIT");

    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id:              user.id,
        name:            user.name,
        email:           user.email,
        profileComplete: user.profile_complete,
      },
      dog: {
        id:          dog.id,
        name:        dog.name,
        gender:      dog.gender,
        breed:       dog.breed,
        dob:         dog.dob,
        lifeStage:   dog.life_stage,
        personality: dog.personality,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Register error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  } finally {
    client.release();
  }
});

// POST /api/auth/login 
router.post("/login", loginValidation, async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.array().reduce((acc: Record<string, string>, err: any) => {
        acc[err.path] = err.msg;
        return acc;
      }, {}),
    });
    return;
  }

  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT id, name, email, password_hash, profile_complete
       FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        message: "Validation failed",
        errors: { email: "No account found with this email" },
      });
      return;
    }

    const user = userResult.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({
        message: "Validation failed",
        errors: { password: "Incorrect password" },
      });
      return;
    }

    const dogResult = await pool.query(
      `SELECT id, name, gender, breed, dob, life_stage, personality, avatar_url
       FROM dogs WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );
    const dog = dogResult.rows[0] || null;

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      message: "Login successful!",
      token,
      user: {
        id:              user.id,
        name:            user.name,
        email:           user.email,
        profileComplete: user.profile_complete,
      },
      dog: dog ? {
        id:          dog.id,
        name:        dog.name,
        gender:      dog.gender,
        breed:       dog.breed,
        dob:         dog.dob,
        lifeStage:   dog.life_stage,
        personality: dog.personality,
        avatarUrl:   dog.avatar_url,
      } : null,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userResult = await pool.query(
      `SELECT id, name, email, profile_complete, created_at
       FROM users WHERE id = $1`,
      [req.user!.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = userResult.rows[0];

    const dogResult = await pool.query(
      `SELECT id, name, gender, breed, dob, life_stage, personality, avatar_url
       FROM dogs WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );
    const dog = dogResult.rows[0] || null;

    res.json({
      user: {
        id:              user.id,
        name:            user.name,
        email:           user.email,
        profileComplete: user.profile_complete,
        createdAt:       user.created_at,
      },
      dog: dog ? {
        id:          dog.id,
        name:        dog.name,
        gender:      dog.gender,
        breed:       dog.breed,
        dob:         dog.dob,
        lifeStage:   dog.life_stage,
        personality: dog.personality,
        avatarUrl:   dog.avatar_url,
      } : null,
    });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;