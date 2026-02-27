import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

const router = Router();

// ─── Cloudinary config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer — memory storage (we stream to Cloudinary) ───────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// ─── Helper: upload buffer to Cloudinary ─────────────────────────────────────
const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 400, height: 400, crop: "fill" }] },
      (err, result) => {
        if (err || !result) reject(err);
        else resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });

// ─── All routes require auth ──────────────────────────────────────────────────
router.use(authenticate);

// ─── GET /api/users/me ────────────────────────────────────────────────────────
// Full user + dog profile
router.get("/me", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userResult = await pool.query(
      `SELECT id, name, email, profile_complete, avatar_url,
              email_notifications, preferences, created_at, updated_at
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

    res.json({
      user: {
        id:                 user.id,
        name:               user.name,
        email:              user.email,
        profileComplete:    user.profile_complete,
        avatarUrl:          user.avatar_url,
        emailNotifications: user.email_notifications,
        preferences:        user.preferences || {},
        createdAt:          user.created_at,
        updatedAt:          user.updated_at,
      },
      dog: dogResult.rows[0] ? {
        id:          dogResult.rows[0].id,
        name:        dogResult.rows[0].name,
        gender:      dogResult.rows[0].gender,
        breed:       dogResult.rows[0].breed,
        dob:         dogResult.rows[0].dob,
        lifeStage:   dogResult.rows[0].life_stage,
        personality: dogResult.rows[0].personality,
        avatarUrl:   dogResult.rows[0].avatar_url,
      } : null,
    });
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── PATCH /api/users/me ──────────────────────────────────────────────────────
// Edit name, email, password
router.patch("/me", [
  body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),
  body("email").optional().isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("currentPassword").optional().notEmpty().withMessage("Current password is required to change password"),
  body("newPassword").optional()
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Must contain a number"),
], async (req: AuthRequest, res: Response): Promise<void> => {
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

  const { name, email, currentPassword, newPassword } = req.body;
  const userId = req.user!.userId;

  try {
    const userResult = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE id = $1",
      [userId]
    );
    const user = userResult.rows[0];

    // ── If changing password, verify current password first ──
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({
          message: "Validation failed",
          errors: { currentPassword: "Current password is required to set a new password" },
        });
        return;
      }
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        res.status(400).json({
          message: "Validation failed",
          errors: { currentPassword: "Current password is incorrect" },
        });
        return;
      }
    }

    // ── Check email not taken by another user ──
    if (email && email !== user.email) {
      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, userId]
      );
      if (existing.rows.length > 0) {
        res.status(409).json({
          message: "Validation failed",
          errors: { email: "This email is already in use" },
        });
        return;
      }
    }

    // ── Build update query dynamically ──
    const updates: string[] = [];
    const params: any[]     = [];

    const addUpdate = (field: string, val: any) => {
      params.push(val);
      updates.push(`${field} = $${params.length}`);
    };

    if (name)        addUpdate("name",          name);
    if (email)       addUpdate("email",         email);
    if (newPassword) addUpdate("password_hash", await bcrypt.hash(newPassword, 12));

    if (updates.length === 0) {
      res.status(400).json({ message: "No changes provided" });
      return;
    }

    params.push(userId);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${params.length}
       RETURNING id, name, email, profile_complete, avatar_url, updated_at`,
      params
    );

    res.json({
      message: "Profile updated successfully",
      user: {
        id:              result.rows[0].id,
        name:            result.rows[0].name,
        email:           result.rows[0].email,
        profileComplete: result.rows[0].profile_complete,
        avatarUrl:       result.rows[0].avatar_url,
        updatedAt:       result.rows[0].updated_at,
      },
    });
  } catch (err) {
    console.error("PATCH /users/me error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── POST /api/users/me/avatar ────────────────────────────────────────────────
// Upload user profile photo
router.post("/me/avatar", upload.single("avatar"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image provided" });
      return;
    }

    const avatarUrl = await uploadToCloudinary(req.file.buffer, "barkbuddy/users");

    await pool.query(
      "UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2",
      [avatarUrl, req.user!.userId]
    );

    res.json({ message: "Avatar updated", avatarUrl });
  } catch (err) {
    console.error("POST /users/me/avatar error:", err);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

// ─── PATCH /api/users/me/preferences ─────────────────────────────────────────
// Save preferences and email notification settings
router.patch("/me/preferences", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { emailNotifications, preferences } = req.body;

    const updates: string[] = [];
    const params: any[]     = [];

    const addUpdate = (field: string, val: any) => {
      params.push(val);
      updates.push(`${field} = $${params.length}`);
    };

    if (typeof emailNotifications === "boolean") addUpdate("email_notifications", emailNotifications);
    if (preferences) addUpdate("preferences", JSON.stringify(preferences));

    if (updates.length === 0) {
      res.status(400).json({ message: "No changes provided" });
      return;
    }

    params.push(req.user!.userId);
    await pool.query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${params.length}`,
      params
    );

    res.json({ message: "Preferences updated" });
  } catch (err) {
    console.error("PATCH /users/me/preferences error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── PATCH /api/users/me/dog ──────────────────────────────────────────────────
// Edit dog details
router.patch("/me/dog", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, breed, gender, dob, lifeStage, personality } = req.body;

    const updates: string[] = [];
    const params: any[]     = [];

    const addUpdate = (field: string, val: any) => {
      params.push(val);
      updates.push(`${field} = $${params.length}`);
    };

    if (name)        addUpdate("name",        name);
    if (breed)       addUpdate("breed",       breed);
    if (gender)      addUpdate("gender",      gender);
    if (dob)         addUpdate("dob",         dob);
    if (lifeStage)   addUpdate("life_stage",  lifeStage);
    if (personality) addUpdate("personality", personality);

    if (updates.length === 0) {
      res.status(400).json({ message: "No changes provided" });
      return;
    }

    params.push(req.user!.userId);
    const result = await pool.query(
      `UPDATE dogs SET ${updates.join(", ")}, updated_at = NOW()
       WHERE user_id = $${params.length}
       RETURNING id, name, gender, breed, dob, life_stage, personality, avatar_url`,
      params
    );

    res.json({
      message: "Dog profile updated",
      dog: {
        id:          result.rows[0].id,
        name:        result.rows[0].name,
        gender:      result.rows[0].gender,
        breed:       result.rows[0].breed,
        dob:         result.rows[0].dob,
        lifeStage:   result.rows[0].life_stage,
        personality: result.rows[0].personality,
        avatarUrl:   result.rows[0].avatar_url,
      },
    });
  } catch (err) {
    console.error("PATCH /users/me/dog error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── POST /api/users/me/dog/avatar ────────────────────────────────────────────
// Upload dog profile photo
router.post("/me/dog/avatar", upload.single("avatar"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image provided" });
      return;
    }

    const avatarUrl = await uploadToCloudinary(req.file.buffer, "barkbuddy/dogs");

    await pool.query(
      "UPDATE dogs SET avatar_url = $1, updated_at = NOW() WHERE user_id = $2",
      [avatarUrl, req.user!.userId]
    );

    res.json({ message: "Dog avatar updated", avatarUrl });
  } catch (err) {
    console.error("POST /users/me/dog/avatar error:", err);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

export default router;