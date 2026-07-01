import { Router, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import pool from "../db";
import { signToken } from "../utils/jwt";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory OTP store (lost on restart — acceptable for Render free tier)
const pendingCodes = new Map<string, { code: string; expiresAt: number }>();
const CODE_TTL_MS  = 10 * 60 * 1000; // 10 minutes

function generateCode(): string {
    return String(crypto.randomInt(100000, 999999));
}

// Auto-calculate life stage from date of birth
function calculateLifeStage(dob: string): "puppy" | "adult" | "senior" {
    const birth      = new Date(dob);
    const now        = new Date();
    const ageMonths  =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth()    - birth.getMonth());

    if (ageMonths < 12) return "puppy";
    if (ageMonths < 84) return "adult"; // < 7 years
    return "senior";
}

// ── Validation rules ──────────────────────────────────────────────────────────

const registerValidation = [
    body("email")
        .isEmail().withMessage("Please enter a valid email address")
        .normalizeEmail(),
    body("name")
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),
    // Fix 2: matches Android's "Min 6 characters" hint and validation
    body("password")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    // Fix 4: confirmPassword is validated client-side; skip server-side to avoid
    // false 400s when Android doesn't send it in the request body
    body("dogName")
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage("Dog name is required"),
    body("breed")
        .trim()
        .isLength({ min: 1 }).withMessage("Please select a breed"),
    // Fix 3: lifeStage is auto-calculated from DOB if present,
    // otherwise required manually. At least one of the two must exist.
    body().custom((_value, { req }) => {
        const hasDob       = req.body.dogDob && req.body.dogDob.trim() !== "";
        const hasLifeStage = req.body.lifeStage && req.body.lifeStage.trim() !== "";
        if (!hasDob && !hasLifeStage) {
            throw new Error(
                "Please provide your dog's date of birth or select a life stage"
            );
        }
        return true;
    }),
    body("lifeStage")
        .optional({ checkFalsy: true })
        .isIn(["puppy", "adult", "senior"])
        .withMessage("Invalid life stage"),
    body("personality")
        .isArray({ min: 1 }).withMessage("Please select at least one personality trait"),
];

const loginValidation = [
    body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
];

// ── GET /api/auth/check-email?email= ─────────────────────────────────────────
// Fix 1: only one check-email endpoint; GET matches Android's @GET("auth/check-email")
router.get(
    "/check-email",
    query("email").isEmail().normalizeEmail(),
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ message: "A valid email is required" });
            return;
        }

        const email = (req.query.email as string).toLowerCase().trim();

        try {
            const result = await pool.query(
                "SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1",
                [email]
            );
            res.json({ exists: result.rows.length > 0 });
        } catch (err) {
            console.error("GET /auth/check-email error:", err);
            res.status(500).json({ message: "Something went wrong." });
        }
    }
);

// ── POST /api/auth/send-verification ─────────────────────────────────────────
router.post("/send-verification", async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
        res.status(400).json({ message: "A valid email is required." });
        return;
    }

    const normalised = email.toLowerCase().trim();

    try {
        // Block immediately if email is already registered
        const existing = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1",
            [normalised]
        );
        if (existing.rows.length > 0) {
            res.status(409).json({
                message: "This email is already registered. Please log in instead.",
                code:    "EMAIL_EXISTS",
            });
            return;
        }

        const code      = generateCode();
        const expiresAt = Date.now() + CODE_TTL_MS;
        pendingCodes.set(normalised, { code, expiresAt });

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
                        background: #f3eeff; border-radius: 12px; padding: 24px;
                        text-align: center; letter-spacing: 0.3em;
                        font-size: 2.2rem; font-weight: 700; color: #4c2d6e;
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
        console.error("send-verification error:", err);
        res.status(500).json({ message: "Failed to send the verification email. Please try again." });
    }
});

// ── POST /api/auth/verify-code ────────────────────────────────────────────────
router.post("/verify-code", (req: Request, res: Response): void => {
    const { email, code } = req.body;

    if (!email || !code) {
        res.status(400).json({ message: "Email and code are required." });
        return;
    }

    const record = pendingCodes.get(email.toLowerCase());

    if (!record) {
        res.status(400).json({
            valid:   false,
            message: "No verification code found for this email. Please request a new one.",
        });
        return;
    }

    if (Date.now() > record.expiresAt) {
        pendingCodes.delete(email.toLowerCase());
        res.status(400).json({
            valid:   false,
            message: "Your code has expired. Please request a new one.",
        });
        return;
    }

    const expected = Buffer.from(record.code);
    const received = Buffer.from(code);
    const valid    =
        expected.length === received.length &&
        crypto.timingSafeEqual(expected, received);

    if (valid) pendingCodes.delete(email.toLowerCase());

    res.status(200).json({ valid });
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", registerValidation, async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: errors.array()[0].msg, // send the first error as the top-level message
            errors:  errors.array().reduce((acc: Record<string, string>, err: any) => {
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
        // Double-check email uniqueness at registration time
        const existing = await client.query(
            "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
            [email]
        );
        if (existing.rows.length > 0) {
            res.status(409).json({
                message: "An account with this email already exists",
                errors:  { email: "An account with this email already exists" },
            });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // DOB takes priority — always calculate life stage server-side when DOB is present
        const resolvedLifeStage = dogDob && dogDob.trim() !== ""
            ? calculateLifeStage(dogDob)
            : lifeStage;

        // Log incoming payload in dev so you can see what arrived
        console.log("Register payload:", {
            name, email, dogName, breed,
            dogGender, dogDob, lifeStage, resolvedLifeStage,
            personalityType: typeof personality,
            personality,
        });

        await client.query("BEGIN");

        const userResult = await client.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, profile_complete, created_at`,
            [name, email, passwordHash]
        );
        const user = userResult.rows[0];

        // Normalise personality — accept both JS array and JSON string from client
        let personalityValue: string[] = [];
        if (Array.isArray(personality)) {
            personalityValue = personality;
        } else if (typeof personality === "string") {
            try { personalityValue = JSON.parse(personality); } catch { personalityValue = []; }
        }

        const dogResult = await client.query(
            `INSERT INTO dogs (user_id, name, gender, breed, dob, life_stage, personality)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, name, gender, breed, dob, life_stage, personality`,
            [
                user.id,
                dogName,
                dogGender        || null,
                breed            || "Mixed Breed",
                dogDob           || null,
                resolvedLifeStage || null,
                personalityValue,
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
    } catch (err: any) {
        await client.query("ROLLBACK");
        console.error("Register error:", err?.message || err);
        console.error("Register error detail:", err?.detail || "");
        console.error("Register error code:", err?.code || "");
        res.status(500).json({ message: "Something went wrong. Please try again." });
    } finally {
        client.release();
    }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", loginValidation, async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: errors.array()[0].msg,
            errors:  errors.array().reduce((acc: Record<string, string>, err: any) => {
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
             FROM users WHERE LOWER(email) = LOWER($1)`,
            [email]
        );

        if (userResult.rows.length === 0) {
            res.status(401).json({
                message: "No account found with this email",
                errors:  { email: "No account found with this email" },
            });
            return;
        }

        const user  = userResult.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            res.status(401).json({
                message: "Incorrect password",
                errors:  { password: "Incorrect password" },
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

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
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