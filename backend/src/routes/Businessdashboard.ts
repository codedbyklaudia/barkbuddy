import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import pool from "../db";

const router     = Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// ─── Auth middleware ───────────────────────────────────────────────────────────
function requireBizAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { res.status(401).json({ message: "Unauthorised" }); return; }
  try {
    const payload: any = jwt.verify(header.slice(7), JWT_SECRET);
    if (payload.type !== "business") { res.status(403).json({ message: "Forbidden" }); return; }
    (req as any).bizId       = payload.sub;
    (req as any).bizUsername = payload.username;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

// ─── Multer for photo uploads ──────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG or WEBP images are allowed"));
  },
});

// ─── GET /api/business/dashboard/me ──────────────────────────────────────────
router.get("/me", requireBizAuth, async (req: Request, res: Response): Promise<void> => {
  const bizId = (req as any).bizId;
  try {
    const { rows } = await pool.query(
      `SELECT ba.id, ba.email, ba.personal_name, ba.business_name,
              ba.category, ba.type, ba.address, ba.postcode,
              ba.contact_phone, ba.contact_email, ba.website,
              ba.description, ba.username, ba.status,
              ba.must_change_password, ba.approved_at,
              bsd.price_list, bsd.additional_info
       FROM business_accounts ba
       LEFT JOIN business_service_details bsd ON bsd.business_id = ba.id
       WHERE ba.id = $1 AND ba.deleted_at IS NULL`,
      [bizId]
    );
    if (rows.length === 0) { res.status(404).json({ message: "Account not found" }); return; }

    // Fetch photos
    const { rows: photos } = await pool.query(
      "SELECT id, cloudinary_url, caption, is_primary FROM business_photos WHERE business_id = $1 ORDER BY is_primary DESC, created_at ASC",
      [bizId]
    );

    res.json({ business: rows[0], photos });
  } catch (err) {
    console.error("Dashboard me error:", err);
    res.status(500).json({ message: "Failed to load profile." });
  }
});

// ─── PATCH /api/business/dashboard/profile ────────────────────────────────────
router.patch("/profile", requireBizAuth, [
  body("businessName").optional().trim().notEmpty().withMessage("Business name cannot be empty"),
  body("description").optional().trim(),
  body("address").optional().trim().notEmpty(),
  body("postcode").optional().trim().notEmpty(),
  body("contactPhone").optional().trim(),
  body("contactEmail").optional().isEmail().withMessage("Invalid contact email"),
  body("website").optional().trim(),
  body("priceList").optional().trim(),
  body("additionalInfo").optional().trim(),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.array().reduce((acc: any, e: any) => { acc[e.path] = e.msg; return acc; }, {}),
    });
    return;
  }

  const bizId = (req as any).bizId;
  const {
    businessName, description, address, postcode,
    contactPhone, contactEmail, website,
    priceList, additionalInfo,
  } = req.body;

  try {
    await pool.query(
      `UPDATE business_accounts SET
        business_name  = COALESCE($1, business_name),
        description    = COALESCE($2, description),
        address        = COALESCE($3, address),
        postcode       = COALESCE($4, postcode),
        contact_phone  = COALESCE($5, contact_phone),
        contact_email  = COALESCE($6, contact_email),
        website        = COALESCE($7, website),
        updated_at     = NOW()
       WHERE id = $8`,
      [businessName, description, address, postcode,
       contactPhone, contactEmail, website, bizId]
    );

    // Update service details if provided
    if (priceList !== undefined || additionalInfo !== undefined) {
      await pool.query(
        `INSERT INTO business_service_details (business_id, price_list, additional_info)
         VALUES ($1, $2, $3)
         ON CONFLICT (business_id) DO UPDATE
           SET price_list      = COALESCE($2, business_service_details.price_list),
               additional_info = COALESCE($3, business_service_details.additional_info)`,
        [bizId, priceList ?? null, additionalInfo ?? null]
      );
    }

    res.json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile." });
  }
});

// ─── PATCH /api/business/dashboard/username ───────────────────────────────────
router.patch("/username", requireBizAuth, async (req: Request, res: Response): Promise<void> => {
  const bizId    = (req as any).bizId;
  const { username } = req.body;

  if (!username?.trim()) { res.status(400).json({ message: "Username is required." }); return; }

  const clean = username.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,30}$/.test(clean)) {
    res.status(400).json({ message: "Username must be 3–30 characters, letters, numbers, or hyphens only." });
    return;
  }

  try {
    const { rows } = await pool.query(
      "SELECT id FROM business_accounts WHERE username = $1 AND id != $2",
      [clean, bizId]
    );
    if (rows.length > 0) { res.status(409).json({ message: "That username is already taken." }); return; }

    await pool.query(
      "UPDATE business_accounts SET username = $1, updated_at = NOW() WHERE id = $2",
      [clean, bizId]
    );
    res.json({ message: "Username updated successfully.", username: clean });
  } catch (err) {
    console.error("Username update error:", err);
    res.status(500).json({ message: "Failed to update username." });
  }
});

// ─── PATCH /api/business/dashboard/password ───────────────────────────────────
router.patch("/password", requireBizAuth, [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 }).withMessage("At least 8 characters")
    .matches(/[A-Z]/).withMessage("Must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Must contain a number"),
  body("confirmPassword").custom((v, { req }) => {
    if (v !== req.body.newPassword) throw new Error("Passwords do not match");
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

  const bizId = (req as any).bizId;
  const { currentPassword, newPassword } = req.body;

  try {
    const { rows } = await pool.query(
      "SELECT password_hash FROM business_accounts WHERE id = $1",
      [bizId]
    );
    if (rows.length === 0) { res.status(404).json({ message: "Account not found." }); return; }

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) { res.status(401).json({ message: "Current password is incorrect." }); return; }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      "UPDATE business_accounts SET password_hash = $1, must_change_password = false, updated_at = NOW() WHERE id = $2",
      [passwordHash, bizId]
    );

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Failed to change password." });
  }
});

// ─── POST /api/business/dashboard/photos ──────────────────────────────────────
router.post("/photos", requireBizAuth, upload.single("photo"), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) { res.status(400).json({ message: "No photo uploaded." }); return; }
  const bizId   = (req as any).bizId;
  const caption = req.body.caption?.trim() || null;

  try {
    // Check limit — max 8 photos
    const { rows: existing } = await pool.query(
      "SELECT COUNT(*) FROM business_photos WHERE business_id = $1",
      [bizId]
    );
    if (parseInt(existing[0].count) >= 8) {
      res.status(400).json({ message: "Maximum 8 photos allowed. Please delete one first." });
      return;
    }

    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "barkbuddy/business-photos", public_id: `biz_${bizId}_${Date.now()}` },
        (err, r) => err ? reject(err) : resolve(r)
      );
      stream.end(req.file!.buffer);
    });

    // If first photo, make it primary
    const { rows: count } = await pool.query(
      "SELECT COUNT(*) FROM business_photos WHERE business_id = $1",
      [bizId]
    );
    const isPrimary = parseInt(count[0].count) === 0;

    const { rows: photo } = await pool.query(
      `INSERT INTO business_photos (business_id, cloudinary_id, cloudinary_url, caption, is_primary)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [bizId, result.public_id, result.secure_url, caption, isPrimary]
    );

    res.status(201).json({ message: "Photo uploaded.", photo: photo[0] });
  } catch (err) {
    console.error("Photo upload error:", err);
    res.status(500).json({ message: "Failed to upload photo." });
  }
});

// ─── DELETE /api/business/dashboard/photos/:photoId ───────────────────────────
router.delete("/photos/:photoId", requireBizAuth, async (req: Request, res: Response): Promise<void> => {
  const bizId   = (req as any).bizId;
  const photoId = parseInt(req.params.photoId);

  try {
    const { rows } = await pool.query(
      "SELECT cloudinary_id, is_primary FROM business_photos WHERE id = $1 AND business_id = $2",
      [photoId, bizId]
    );
    if (rows.length === 0) { res.status(404).json({ message: "Photo not found." }); return; }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(rows[0].cloudinary_id);
    await pool.query("DELETE FROM business_photos WHERE id = $1", [photoId]);

    // If deleted photo was primary, make the next one primary
    if (rows[0].is_primary) {
      await pool.query(
        `UPDATE business_photos SET is_primary = true
         WHERE id = (SELECT id FROM business_photos WHERE business_id = $1 ORDER BY created_at ASC LIMIT 1)`,
        [bizId]
      );
    }

    res.json({ message: "Photo deleted." });
  } catch (err) {
    console.error("Photo delete error:", err);
    res.status(500).json({ message: "Failed to delete photo." });
  }
});

// ─── PATCH /api/business/dashboard/photos/:photoId/primary ────────────────────
router.patch("/photos/:photoId/primary", requireBizAuth, async (req: Request, res: Response): Promise<void> => {
  const bizId   = (req as any).bizId;
  const photoId = parseInt(req.params.photoId);

  try {
    await pool.query("BEGIN");
    await pool.query("UPDATE business_photos SET is_primary = false WHERE business_id = $1", [bizId]);
    await pool.query(
      "UPDATE business_photos SET is_primary = true WHERE id = $1 AND business_id = $2",
      [photoId, bizId]
    );
    await pool.query("COMMIT");
    res.json({ message: "Primary photo updated." });
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: "Failed to update primary photo." });
  }
});

export default router;