import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import multer from "multer";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";
import pool from "../db";
import { geocodeUKAddress } from "../utils/geocode";

const router = Router();

const CLIENT_URL = process.env.CLIENT_URL  || "http://localhost:5173";
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

// ─── Gmail transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   "smtp.gmail.com",
  port:   465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  tls:  { rejectUnauthorized: false },
});

transporter.verify((error) => {
  if (error) console.error("❌ Business mailer config error:", error);
  else       console.log("✅ Business mailer ready — connected to Gmail as", GMAIL_USER);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateToken = () => crypto.randomBytes(32).toString("hex");

/** Single helper for all Cloudinary uploads — eliminates duplicated Promise boilerplate */
async function uploadToCloudinary(
  buffer: Buffer,
  options: Parameters<typeof cloudinary.uploader.upload_stream>[0]
): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) =>
      error ? reject(error) : resolve(result)
    );
    stream.end(buffer);
  });
}

// ─── Multer ───────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only PDF, JPG, PNG or WEBP files are allowed"));
  },
});

// ─── Validators ───────────────────────────────────────────────────────────────
const accountValidators = [
  body("email").trim().isEmail().withMessage("Enter a valid email"),
  body("personalName").trim().notEmpty().withMessage("Name is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("confirmPassword").custom((val, { req }) => {
    if (val !== req.body.password) throw new Error("Passwords don't match");
    return true;
  }),
  body("businessName").trim().notEmpty().withMessage("Business name is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("postcode").trim().notEmpty().withMessage("Postcode is required"),
];

const serviceValidators  = [...accountValidators, body("serviceType").trim().notEmpty().withMessage("Please select a service type")];
const activityValidators = [...accountValidators, body("activityType").trim().notEmpty().withMessage("Please select a venue type")];

function formatErrors(result: ReturnType<typeof validationResult>) {
  return result.array().reduce((acc: Record<string, string>, err: any) => {
    if (!acc[err.path]) acc[err.path] = err.msg;
    return acc;
  }, {});
}

// ─── Email ────────────────────────────────────────────────────────────────────
async function sendVerificationEmail(
  to: string,
  personalName: string,
  businessName: string,
  verifyUrl: string,
  isActivity: boolean
): Promise<void> {
  await transporter.sendMail({
    from:    `"BarkBuddy for Business 🐾" <${GMAIL_USER}>`,
    to,
    subject: isActivity
      ? `Verify your email - BarkBuddy application for ${businessName}`
      : `Welcome to BarkBuddy Business - please verify your email`,
    html: generateVerificationEmailHtml(personalName, businessName, verifyUrl, isActivity),
  });
}

const generateVerificationEmailHtml = (
  name: string,
  businessName: string,
  verifyUrl: string,
  isActivity: boolean
): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f1fb;font-family:'Marcellus',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1fb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(91,33,182,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3a2f51 0%,#b79ebe 100%);padding:36px 40px;text-align:center;">
              <div style="font-size:30px;margin-bottom:8px;">🐾</div>
              <h1 style="color:#f7f7f7;font-size:26px;font-weight:400;letter-spacing:0.04em;margin:0;">BarkBuddy for Business</h1>
              <p style="color:rgba(247,247,247,0.75);font-size:14px;margin:6px 0 0;">
                ${isActivity ? "Application Received" : "Welcome aboard!"}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="color:#1e1b4b;font-size:15px;margin:0 0 12px;">
                Hi <strong>${name}</strong>,
              </p>

              ${isActivity ? `
              <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 16px;">
                Thank you for applying to list <strong>${businessName}</strong> on BarkBuddy!
                We've received your application and our team will review your document within <strong>72 hours</strong>.
              </p>
              <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 24px;">
                Before we can process your application, please verify your email address by clicking the button below.
              </p>
              ` : `
              <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 16px;">
                You're almost live on BarkBuddy! We just need to verify your email address before
                <strong>${businessName}</strong> goes live in our directory.
              </p>
              <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 24px;">
                Click the button below to confirm your email — this link expires in <strong>24 hours</strong>.
              </p>
              `}

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 28px;">
                    <a href="${verifyUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#3a2f51,#b79ebe);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 40px;border-radius:50px;letter-spacing:0.03em;">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="color:#6b7280;font-size:12px;line-height:1.5;margin:0 0 8px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="background:#f4f1fb;border-radius:8px;padding:10px 14px;font-size:11px;color:#3a2f51;word-break:break-all;margin:0 0 24px;">
                ${verifyUrl}
              </p>

              ${isActivity ? `
              <div style="background:#f9f7ff;border:1px solid #e8e0ff;border-radius:10px;padding:18px 20px;margin:0 0 24px;">
                <p style="color:#3a2f51;font-size:13px;font-weight:600;margin:0 0 10px;">What happens next?</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:4px 10px 4px 0;font-size:13px;">✅</td>
                    <td style="padding:4px 0;font-size:13px;color:#4b5563;">You verify your email (now)</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 10px 4px 0;font-size:13px;">🔍</td>
                    <td style="padding:4px 0;font-size:13px;color:#4b5563;">Our team reviews your dog-friendly document (up to 72 hours)</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 10px 4px 0;font-size:13px;">📬</td>
                    <td style="padding:4px 0;font-size:13px;color:#4b5563;">You get an email with the outcome</td>
                  </tr>
                </table>
              </div>
              ` : ""}

              <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0;border-top:1px solid #f3f4f6;padding-top:20px;">
                If you didn't create a BarkBuddy Business account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
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

// POST /api/business/register/service 
router.post(
  "/register/service",
  upload.single("photo"),
  serviceValidators,
  async (req: Request, res: Response): Promise<void> => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ message: "Validation failed", errors: formatErrors(result) });
      return;
    }

    const {
      email, personalName, password,
      businessName, serviceType, address, postcode,
      description, priceList, additionalInfo,
      contactPhone, contactEmail, website,
    } = req.body;

    const client = await pool.connect();
    try {
      const exists = await client.query(
        "SELECT id FROM business_accounts WHERE email = $1 AND deleted_at IS NULL",
        [email.toLowerCase()]
      );
      if (exists.rows.length > 0) {
        res.status(409).json({
          message: "Validation failed",
          errors: { email: "An account with this email already exists. Please log in or use a different email." },
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const coords = await geocodeUKAddress(address, postcode).catch(() => null);

      await client.query("BEGIN");

      const bizResult = await client.query(
        `INSERT INTO business_accounts
           (email, personal_name, password_hash, business_name, category, type,
            address, postcode, contact_phone, contact_email, website, description, status, email_verified, lat, lng)
         VALUES ($1,$2,$3,$4,'services',$5,$6,$7,$8,$9,$10,$11,'pending',false,$12,$13)
         RETURNING id`,
        [
          email.toLowerCase(), personalName, passwordHash,
          businessName, serviceType, address, postcode,
          contactPhone || null, contactEmail || null, website || null,
          description || null,
          coords?.lat ?? null, coords?.lng ?? null,
        ]
      );
      const businessId = bizResult.rows[0].id;

      await client.query(
        `INSERT INTO business_service_details (business_id, price_list, additional_info) VALUES ($1,$2,$3)`,
        [businessId, priceList || null, additionalInfo || null]
      );

      const token     = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await client.query(
        `INSERT INTO business_verification_tokens (business_id, token, expires_at) VALUES ($1,$2,$3)`,
        [businessId, token, expiresAt]
      );

      await client.query("COMMIT");

      // Photo upload AFTER commit — failure cannot roll back account or token
      if (req.file) {
        try {
          const photoResult = await uploadToCloudinary(req.file.buffer, {
            folder:    "barkbuddy/business-photos",
            public_id: `biz_${businessId}_cover`,
          });
          await pool.query(
            `INSERT INTO business_photos (business_id, cloudinary_id, cloudinary_url, is_primary) VALUES ($1,$2,$3,true)`,
            [businessId, photoResult.public_id, photoResult.secure_url]
          );
        } catch (photoErr) {
          console.error("Photo upload error (service):", photoErr);
        }
      }

      const verifyUrl = `${CLIENT_URL}/#/business/verify-email?token=${token}`;
      try {
        await sendVerificationEmail(email, personalName, businessName, verifyUrl, false);
        console.log("✅ Verification email sent (service) to:", email);
      } catch (emailErr: any) {
        console.error("❌ Verification email failed (service) to:", email, emailErr?.message);
      }

      res.status(201).json({
        message: "Service account created. Please check your email to verify your account.",
        businessId,
        status: "pending",
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Service register error:", err);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    } finally {
      client.release();
    }
  }
);

// POST /api/business/register/activity 
router.post(
  "/register/activity",
  upload.fields([{ name: "document", maxCount: 1 }, { name: "photo", maxCount: 1 }]),
  activityValidators,
  async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Record<string, Express.Multer.File[]>;
    if (!files?.document?.[0]) {
      res.status(400).json({ message: "Validation failed", errors: { document: "Please upload a document" } });
      return;
    }
    const docFile = files.document[0];

    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ message: "Validation failed", errors: formatErrors(result) });
      return;
    }

    const {
      email, personalName, password,
      businessName, activityType, address, postcode,
      description, contactPhone, contactEmail, website,
    } = req.body;

    const client = await pool.connect();
    try {
      const exists = await client.query(
        "SELECT id FROM business_accounts WHERE email = $1 AND deleted_at IS NULL",
        [email.toLowerCase()]
      );
      if (exists.rows.length > 0) {
        res.status(409).json({
          message: "Validation failed",
          errors: { email: "An account with this email already exists. Please log in or use a different email." },
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const coords = await geocodeUKAddress(address, postcode).catch(() => null);

      // Document upload BEFORE transaction — required data, early failure is correct
      let cloudinaryResult: any;
      try {
        cloudinaryResult = await uploadToCloudinary(docFile.buffer, {
          folder:        "barkbuddy/business-docs",
          resource_type: docFile.mimetype === "application/pdf" ? "raw" : "image",
          public_id:     `doc_${Date.now()}`,
        });
      } catch (uploadErr) {
        console.error("Cloudinary document upload error:", uploadErr);
        res.status(500).json({ message: "Failed to upload document. Please try again." });
        return;
      }

      await client.query("BEGIN");

      const bizResult = await client.query(
        `INSERT INTO business_accounts
           (email, personal_name, password_hash, business_name, category, type,
            address, postcode, contact_phone, contact_email, website, description, status, email_verified, lat, lng)
         VALUES ($1,$2,$3,$4,'activities',$5,$6,$7,$8,$9,$10,$11,'pending',false,$12,$13)
         RETURNING id`,
        [
          email.toLowerCase(), personalName, passwordHash,
          businessName, activityType, address, postcode,
          contactPhone || null, contactEmail || null, website || null,
          description || null,
          coords?.lat ?? null, coords?.lng ?? null,
        ]
      );
      const businessId = bizResult.rows[0].id;

      await client.query(
        `INSERT INTO business_activity_documents (business_id, cloudflare_id, cloudflare_url, filename)
         VALUES ($1,$2,$3,$4)`,
        [businessId, cloudinaryResult.public_id, cloudinaryResult.secure_url, docFile.originalname]
      );

      const token     = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await client.query(
        `INSERT INTO business_verification_tokens (business_id, token, expires_at) VALUES ($1,$2,$3)`,
        [businessId, token, expiresAt]
      );

      await client.query("COMMIT");

      // Photo upload AFTER commit — failure is non-fatal
      const photoFile = files?.photo?.[0];
      if (photoFile) {
        try {
          const photoResult = await uploadToCloudinary(photoFile.buffer, {
            folder:    "barkbuddy/business-photos",
            public_id: `biz_${businessId}_cover`,
          });
          await pool.query(
            `INSERT INTO business_photos (business_id, cloudinary_id, cloudinary_url, is_primary) VALUES ($1,$2,$3,true)`,
            [businessId, photoResult.public_id, photoResult.secure_url]
          );
        } catch (photoErr) {
          console.error("Photo upload error (activity):", photoErr);
        }
      }

      const verifyUrl = `${CLIENT_URL}/#/business/verify-email?token=${token}`;
      try {
        await sendVerificationEmail(email, personalName, businessName, verifyUrl, true);
        console.log("✅ Verification email sent (activity) to:", email);
      } catch (emailErr: any) {
        console.error("❌ Verification email failed (activity) to:", email, emailErr?.message);
      }

      res.status(201).json({
        message: "Application submitted. Please check your email to verify your address.",
        businessId,
        status: "pending",
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Activity register error:", err);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    } finally {
      client.release();
    }
  }
);

// GET /api/business/verify-email
router.get("/verify-email", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query as { token: string };

  if (!token) {
    res.status(400).json({ message: "Verification token is missing." });
    return;
  }

  const client = await pool.connect();
  try {
    const tokenResult = await client.query(
      `SELECT bvt.id, bvt.business_id, ba.email_verified
       FROM business_verification_tokens bvt
       JOIN business_accounts ba ON ba.id = bvt.business_id
       WHERE bvt.token = $1
         AND bvt.expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      res.status(400).json({
        message: "This verification link is invalid or has expired. Please contact us at paws@barkbuddy.co.uk",
      });
      return;
    }

    const { id: tokenId, business_id: businessId, email_verified } = tokenResult.rows[0];

    // Already verified — return success immediately (idempotent)
    if (email_verified) {
      res.json({
        verified: true,
        message:  "Email verified! Your application is under review - we'll be in touch within 72 hours.",
      });
      return;
    }

    // Not yet verified — mark account and token
    await client.query("BEGIN");
    await client.query(
      "UPDATE business_accounts SET email_verified = true, updated_at = NOW() WHERE id = $1",
      [businessId]
    );
    await client.query(
      "UPDATE business_verification_tokens SET used = true WHERE id = $1",
      [tokenId]
    );
    await client.query("COMMIT");

    res.json({
      verified: true,
      message:  "Email verified successfully! Your application is under review — we'll be in touch within 72 hours.",
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again or contact hello@barkbuddy.com." });
  } finally {
    client.release();
  }
});

// ─── GET /api/business/test-email ─────────────────────────────────────────────
router.get("/test-email", async (req: Request, res: Response): Promise<void> => {
  const to = (req.query.to as string) || GMAIL_USER;
  try {
    await transporter.sendMail({
      from:    `"BarkBuddy 🐾" <${GMAIL_USER}>`,
      to,
      subject: "BarkBuddy business mailer test",
      html:    "<p>If you can read this, Gmail is configured correctly! 🐾</p>",
    });
    res.json({ ok: true, message: `Test email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ ok: false, code: err?.code, message: err?.message, response: err?.response });
  }
});

// ─── GET /api/business/check-email ────────────────────────────────────────────
router.get("/check-email", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.query as { email: string };
  if (!email) { res.json({ available: false }); return; }
  const result = await pool.query(
    "SELECT id FROM business_accounts WHERE email = $1 AND deleted_at IS NULL",
    [email.toLowerCase()]
  );
  res.json({ available: result.rows.length === 0 });
});

export default router;