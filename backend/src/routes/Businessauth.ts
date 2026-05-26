import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";

const router  = Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// POST /api/business/login 
router.post("/login", [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  const { username, password } = req.body;

  try {
    const { rows } = await pool.query(
      `SELECT id, email, personal_name, business_name, category, type,
              username, password_hash, status, email_verified
       FROM business_accounts
       WHERE username = $1`,
      [username.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const biz = rows[0];

    // Must be approved to log in
    if (biz.status !== "approved") {
      const messages: Record<string, string> = {
        pending:  "Your application is still under review. We'll email you once it's been approved.",
        rejected: "Your application was not approved. Please contact us at paws@barkbuddy.org.uk if you have further questions",
      };
      res.status(403).json({ message: messages[biz.status] ?? "Account not active" });
      return;
    }

    const valid = await bcrypt.compare(password, biz.password_hash);
    if (!valid) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const token = jwt.sign(
      {
        sub:          biz.id,
        type:         "business",
        username:     biz.username,
        businessName: biz.business_name,
        category:     biz.category,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      business: {
        id:           biz.id,
        username:     biz.username,
        personalName: biz.personal_name,
        businessName: biz.business_name,
        category:     biz.category,
        type:         biz.type,
        email:        biz.email,
      },
    });
  } catch (err) {
    console.error("Business login error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// Authenticated — change own username
router.patch("/username", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorised" });
    return;
  }

  const token = authHeader.slice(7);
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  if (payload.type !== "business") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const { username } = req.body;

  if (!username?.trim()) {
    res.status(400).json({ message: "Username is required" });
    return;
  }

  const clean = username.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,30}$/.test(clean)) {
    res.status(400).json({
      message: "Username must be 3–30 characters and contain only letters, numbers, or hyphens",
    });
    return;
  }

  try {
    const { rows: existing } = await pool.query(
      "SELECT id FROM business_accounts WHERE username = $1 AND id != $2",
      [clean, payload.sub]
    );
    if (existing.length > 0) {
      res.status(409).json({ message: "That username is already taken" });
      return;
    }

    await pool.query(
      "UPDATE business_accounts SET username = $1, updated_at = NOW() WHERE id = $2",
      [clean, payload.sub]
    );

    res.json({ message: "Username updated successfully", username: clean });
  } catch (err) {
    console.error("Change username error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

export default router;