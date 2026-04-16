import { Router, Request, Response } from "express";
import crypto from "crypto";
import multer from "multer";
import { Resend } from "resend";
import pool from "../db";
import { uploadToCloudinary } from "../lib/uploadCloudinary";
import cloudinary from "../lib/cloudinary";

const router     = Router();
const CLIENT_URL   = process.env.CLIENT_URL   || "http://localhost:5173";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "changeme";
const FROM         = "BarkBuddy <paws@barkbuddy.org.uk>";

const resend = new Resend(process.env.RESEND_API_KEY);

const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only JPG, PNG or WEBP allowed"));
  },
});

// Extract Cloudinary public_id from a cloudinary_url
function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Middleware: simple admin auth via secret header
function requireAdmin(req: Request, res: Response, next: Function) {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== ADMIN_SECRET) {
    res.status(401).json({ message: "Unauthorised" });
    return;
  }
  next();
}

// Username generator
const ADJECTIVES = [
  "golden","happy","brave","gentle","swift","wild","calm","bright",
  "clever","eager","fluffy","jolly","kind","lively","merry","noble",
  "proud","quiet","rusty","sunny","tidy","vivid","warm","zesty",
];
const NOUNS = [
  "river","forest","pebble","meadow","willow","paw","trail","valley",
  "brook","cloud","ember","fern","grove","haven","island","leaf",
  "maple","nest","oak","pine","ridge","stone","tide","wave",
];

function generateUsername(): string {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num  = Math.floor(100 + Math.random() * 900);
  return `${adj}-${noun}-${num}`;
}

async function uniqueUsername(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateUsername();
    const { rows } = await pool.query(
      "SELECT id FROM business_accounts WHERE username = $1",
      [candidate]
    );
    if (rows.length === 0) return candidate;
  }
  return `${generateUsername()}-${crypto.randomBytes(3).toString("hex")}`;
}

// GET /api/admin/businesses
router.get("/businesses", requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.query;

  const query = status
    ? `SELECT id, email, personal_name, business_name, category, type,
              address, postcode, status, email_verified, username,
              created_at, approved_at
       FROM business_accounts
       WHERE status = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC`
    : `SELECT id, email, personal_name, business_name, category, type,
              address, postcode, status, email_verified, username,
              created_at, approved_at
       FROM business_accounts
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`;

  try {
    const { rows } = await pool.query(query, status ? [status] : []);
    res.json({ businesses: rows });
  } catch (err) {
    console.error("Admin list error:", err);
    res.status(500).json({ message: "Failed to fetch businesses" });
  }
});

// GET /api/admin/businesses/:id
router.get("/businesses/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT ba.*,
              bsd.price_list, bsd.additional_info,
              bad.cloudflare_url AS document_url, bad.filename AS document_filename
       FROM business_accounts ba
       LEFT JOIN business_service_details    bsd ON bsd.business_id = ba.id
       LEFT JOIN business_activity_documents bad ON bad.business_id = ba.id
       WHERE ba.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "Business not found" });
      return;
    }
    res.json({ business: rows[0] });
  } catch (err) {
    console.error("Admin get error:", err);
    res.status(500).json({ message: "Failed to fetch business" });
  }
});

// POST /api/admin/businesses/:id/approve
router.post("/businesses/:id/approve", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM business_accounts WHERE id = $1",
      [id]
    );
    if (rows.length === 0) { res.status(404).json({ message: "Business not found" }); return; }

    const biz = rows[0];
    if (biz.status === "approved") { res.status(409).json({ message: "Already approved" }); return; }

    const username = await uniqueUsername();

    await pool.query(
      `UPDATE business_accounts
       SET status = 'approved', username = $1, must_change_password = true, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [username, id]
    );

    const isActivity = biz.category === "activities";
    try {
      await resend.emails.send({
        from:    FROM,
        to:      biz.email,
        subject: `🎉 You're live on BarkBuddy — here's your login`,
        html:    approvalEmailHtml(biz.personal_name, biz.business_name, username, isActivity),
      });
      console.log("✅ Approval email sent to:", biz.email);
    } catch (emailErr) {
      console.error("❌ Approval email failed:", emailErr);
    }

    res.json({
      message:  "Business approved and email sent",
      username,
      business: { ...biz, status: "approved", username, approved_at: new Date() },
    });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ message: "Failed to approve business" });
  }
});

// POST /api/admin/businesses/:id/reject
router.post("/businesses/:id/reject", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM business_accounts WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (rows.length === 0) { res.status(404).json({ message: "Business not found" }); return; }

    const biz = rows[0];

    await pool.query("BEGIN");

    await pool.query(
      `INSERT INTO business_rejections
         (email, personal_name, business_name, category, type, address, postcode, rejection_reason, applied_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [biz.email, biz.personal_name, biz.business_name, biz.category,
       biz.type, biz.address, biz.postcode, reason || null, biz.created_at]
    );

    await pool.query(
      `UPDATE business_accounts
       SET status = 'rejected', deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    await pool.query("COMMIT");

    try {
      await resend.emails.send({
        from:    FROM,
        to:      biz.email,
        subject: `Your BarkBuddy application for ${biz.business_name}`,
        html:    rejectionEmailHtml(biz.personal_name, biz.business_name, reason),
      });
      console.log("✅ Rejection email sent to:", biz.email);
    } catch (emailErr) {
      console.error("❌ Rejection email failed:", emailErr);
    }

    res.json({ message: "Business rejected and email sent" });
  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("Reject error:", err);
    res.status(500).json({ message: "Failed to reject business" });
  }
});

// GET /api/admin/businesses/:id/photos
router.get("/businesses/:id/photos", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, cloudinary_url, caption, is_primary, created_at
       FROM business_photos
       WHERE business_id = $1
       ORDER BY is_primary DESC, created_at ASC`,
      [req.params.id]
    );
    res.json({ photos: rows });
  } catch (err) {
    console.error("Get photos error:", err);
    res.status(500).json({ message: "Failed to load photos." });
  }
});

// POST /api/admin/businesses/:id/photos
router.post("/businesses/:id/photos", requireAdmin, photoUpload.single("photo"), async (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ message: "No file uploaded." }); return; }
  try {
    const businessId = parseInt(req.params.id);
    const caption    = (req.body.caption as string) || null;
    const isPrimary  = req.body.is_primary === "true";

    const photoUrl = await uploadToCloudinary(req.file.buffer, "barkbuddy/business_photos", {
      resource_type: "image",
      public_id: `biz_${businessId}_${Date.now()}`,
    });

    if (isPrimary) {
      await pool.query(
        "UPDATE business_photos SET is_primary = false WHERE business_id = $1",
        [businessId]
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO business_photos (business_id, cloudinary_url, cloudinary_id, caption, is_primary, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [
        businessId,
        photoUrl,
        extractPublicId(photoUrl) ?? `biz_${businessId}_${Date.now()}`,
        caption,
        isPrimary,
      ]
    );

    res.status(201).json({ message: "Photo uploaded.", photo: rows[0] });
  } catch (err) {
    console.error("Upload photo error:", err);
    res.status(500).json({ message: "Failed to upload photo." });
  }
});

// PATCH /api/admin/businesses/:id/photos/:photoId/primary
router.patch("/businesses/:id/photos/:photoId/primary", requireAdmin, async (req: Request, res: Response) => {
  try {
    const businessId = parseInt(req.params.id);
    const photoId    = parseInt(req.params.photoId);

    await pool.query(
      "UPDATE business_photos SET is_primary = false WHERE business_id = $1",
      [businessId]
    );
    await pool.query(
      "UPDATE business_photos SET is_primary = true WHERE id = $1 AND business_id = $2",
      [photoId, businessId]
    );

    res.json({ message: "Primary photo updated." });
  } catch (err) {
    console.error("Set primary error:", err);
    res.status(500).json({ message: "Failed to update primary photo." });
  }
});

// DELETE /api/admin/businesses/:id/photos/:photoId
router.delete("/businesses/:id/photos/:photoId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const businessId = parseInt(req.params.id);
    const photoId    = parseInt(req.params.photoId);

    const { rows } = await pool.query(
      "SELECT cloudinary_url, cloudinary_id FROM business_photos WHERE id = $1 AND business_id = $2",
      [photoId, businessId]
    );
    if (rows.length === 0) { res.status(404).json({ message: "Photo not found." }); return; }

    // Delete from Cloudinary using cloudinary_id first, fall back to extracting from URL
    const publicId = rows[0].cloudinary_id || extractPublicId(rows[0].cloudinary_url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId).catch((err) =>
        console.error("Cloudinary delete error:", err)
      );
    }

    await pool.query(
      "DELETE FROM business_photos WHERE id = $1 AND business_id = $2",
      [photoId, businessId]
    );

    res.json({ message: "Photo deleted." });
  } catch (err) {
    console.error("Delete photo error:", err);
    res.status(500).json({ message: "Failed to delete photo." });
  }
});

// DELETE /api/admin/businesses/:id
router.delete("/businesses/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, business_name FROM business_accounts WHERE id = $1 AND deleted_at IS NULL",
      [req.params.id]
    );
    if (rows.length === 0) { res.status(404).json({ message: "Business not found." }); return; }

    const { rows: photos } = await pool.query(
      "SELECT cloudinary_url, cloudinary_id FROM business_photos WHERE business_id = $1",
      [req.params.id]
    );

    // Delete all photos from Cloudinary — non-fatal
    for (const photo of photos) {
      const publicId = photo.cloudinary_id || extractPublicId(photo.cloudinary_url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch((err) =>
          console.error("Cloudinary delete error:", err)
        );
      }
    }

    await pool.query("BEGIN");
    await pool.query("DELETE FROM business_photos              WHERE business_id = $1", [req.params.id]);
    await pool.query("DELETE FROM business_service_details     WHERE business_id = $1", [req.params.id]);
    await pool.query("DELETE FROM business_activity_documents  WHERE business_id = $1", [req.params.id]);
    await pool.query("DELETE FROM business_verification_tokens WHERE business_id = $1", [req.params.id]);
    await pool.query("DELETE FROM business_accounts            WHERE id = $1",          [req.params.id]);
    await pool.query("COMMIT");

    console.log(`🗑 Business ${req.params.id} (${rows[0].business_name}) permanently deleted by admin`);
    res.json({ message: `${rows[0].business_name} has been permanently deleted.` });
  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("Delete business error:", err);
    res.status(500).json({ message: "Failed to delete business." });
  }
});

// GET /api/admin/rejections
router.get("/rejections", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*,
              (SELECT COUNT(*) FROM business_rejections r2 WHERE r2.email = r.email) AS total_attempts
       FROM business_rejections r
       ORDER BY r.rejected_at DESC`
    );
    res.json({ rejections: rows });
  } catch (err) {
    console.error("Rejections list error:", err);
    res.status(500).json({ message: "Failed to fetch rejections" });
  }
});

// Email templates
const approvalEmailHtml = (
  name: string,
  businessName: string,
  username: string,
  isActivity: boolean
) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f1fb;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1fb;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(91,33,182,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#2d1b69 0%,#5b21b6 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:35px;margin-bottom:8px;">🐾</div>
            <h1 style="color:#3a2f51;font-size:30px;font-weight:400;letter-spacing:0.04em;margin:0;">You're live on BarkBuddy!</h1>
            <p style="color:#3a2f51;font-size:22px;margin:6px 0 0;">${businessName} has been approved</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="color:#141414;font-size:18px;margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
            <p style="color:#141414;font-size:18px;line-height:1.7;margin:0 0 24px;">
              Great news - <strong>${businessName}</strong> has been ${isActivity ? "verified and approved" : "approved"} and is now listed on BarkBuddy. Dog owners in your area can find you right now! 🐾
            </p>
            <div style="background:#f4f1fb;border:2px solid #7c3aed;border-radius:12px;padding:24px;margin:0 0 28px;text-align:center;">
              <p style="font-size:18px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7c3aed;margin:0 0 10px;">Your login username</p>
              <p style="font-size:26px;font-weight:700;color:#2d1b69;letter-spacing:0.06em;margin:0 0 10px;font-family:monospace;">${username}</p>
              <p style="font-size:18px;color:#6b7280;margin:0;">Save this - you'll need it to log in to your dashboard</p>
            </div>
            <p style="color:#4b5563;font-size:18px;line-height:1.7;margin:0 0 8px;">
              Use your username + the password you set during registration to log in at:
            </p>
            <p style="margin:0 0 24px;">
              <a href="${CLIENT_URL}/#/business/login" style="color:#5b21b6;font-size:18px;">${CLIENT_URL}/#/business/login</a>
            </p>
            <p style="color:#6b7280;font-size:18px;line-height:1.6;margin:0 0 8px;">
              From your dashboard you can manage your listing, update your details, and change your username at any time in Settings.
            </p>
            <p style="color:#9ca3af;font-size:18px;line-height:1.5;margin:24px 0 0;border-top:1px solid #f3f4f6;padding-top:20px;">
              If you have any questions, reply to this email or contact us at paws@barkbuddy.org.uk
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} BarkBuddy · Made with 🐾 for dog lovers</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const rejectionEmailHtml = (
  name: string,
  businessName: string,
  reason?: string
) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:'Marcellus',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1fb;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(91,33,182,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#2d1b69 0%,#5b21b6 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:30px;margin-bottom:8px;">🐾</div>
            <h1 style="color:#3a2f51;font-size:30px;font-weight:400;letter-spacing:0.04em;margin:0;">BarkBuddy for Business</h1>
            <p style="color:$3a2f51;font-size:22px;margin:6px 0 0;">Application Update</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="color:#1e1b4b;font-size:18px;margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
            <p style="color:#141414;font-size:18px;line-height:1.7;margin:0 0 16px;">
              Thank you for applying to list <strong>${businessName}</strong> on BarkBuddy.
              After reviewing your application, we're unable to approve it at this time.
            </p>
            ${reason ? `
            <div style="background:#fef2f2;border-left:3px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 20px;">
              <p style="font-size:18px;font-weight:600;color:#991b1b;margin:0 0 6px;">Reason</p>
              <p style="font-size:20px;color:#7f1d1d;margin:0;line-height:1.6;">${reason}</p>
            </div>` : ""}
            <p style="color:#141414;font-size:18px;line-height:1.7;margin:0 0 24px;">
              If you believe this is an error or would like to reapply with additional information,
              please reply to this email or contact us at paws@barkbuddy.org.uk
            </p>
            <p style="color:#9ca3af;font-size:15px;line-height:1.5;margin:0;border-top:1px solid #f3f4f6;padding-top:20px;">
              We appreciate your interest in BarkBuddy and wish you all the best.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="color:#9ca3af;font-size:15px;margin:0;">© ${new Date().getFullYear()} BarkBuddy · Made with 🐾 for dog lovers</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export default router;