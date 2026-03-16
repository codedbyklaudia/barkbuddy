import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// ── Multer — local disk storage ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "../../uploads/dogs");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `dog-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Images only"));
    cb(null, true);
  },
});

// ── Ownership guard ────────────────────────────────────────────────────────────
async function ownsDog(userId: string, dogId: string): Promise<boolean> {
  const { rows } = await pool.query(
    "SELECT id FROM dogs WHERE id = $1 AND user_id = $2",
    [dogId, userId]
  );
  return rows.length > 0;
}

// GET /api/dogs
router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { rows } = await pool.query(
      `SELECT
         id, name, gender, breed, dob,
         life_stage    AS "lifeStage",
         personality,
         avatar_url    AS "avatarUrl",
         is_main       AS "isMain",
         created_at    AS "createdAt"
       FROM dogs
       WHERE user_id = $1
       ORDER BY is_main DESC, created_at ASC`,
      [userId]
    );
    const mainDog   = rows.find((d) => d.isMain) ?? null;
    const extraDogs = rows.filter((d) => !d.isMain);
    res.json({ mainDog, extraDogs, dogs: rows });
  } catch (err) {
    console.error("GET /dogs error:", err);
    res.status(500).json({ message: "Failed to fetch dogs" });
  }
});

// POST /api/dogs
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, breed, gender, dob, lifeStage, personality } = req.body;
    if (!name || !gender || !lifeStage) {
      res.status(400).json({ message: "Missing required fields: name, gender, lifeStage" });
      return;
    }
    const { rows: existing } = await pool.query(
      "SELECT id FROM dogs WHERE user_id = $1",
      [userId]
    );
    const isMain = existing.length === 0;
    const { rows } = await pool.query(
      `INSERT INTO dogs
         (user_id, name, breed, gender, dob, life_stage, personality, is_main, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING
         id, name, gender, breed, dob,
         life_stage  AS "lifeStage",
         personality,
         avatar_url  AS "avatarUrl",
         is_main     AS "isMain"`,
      [userId, name, breed ?? null, gender, dob ?? null, lifeStage, personality ?? [], isMain]
    );
    res.status(201).json({ dog: rows[0] });
  } catch (err) {
    console.error("POST /dogs error:", err);
    res.status(500).json({ message: "Failed to create dog" });
  }
});

// PATCH /api/dogs/:id
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { rows: check } = await pool.query(
      "SELECT user_id, is_main FROM dogs WHERE id = $1",
      [id]
    );
    if (check.length === 0)          { res.status(404).json({ message: "Dog not found" }); return; }
    if (check[0].user_id !== userId) { res.status(403).json({ message: "Not authorized" }); return; }

    const { name, breed, gender, dob, lifeStage, personality } = req.body;
    const sets: string[] = [];
    const vals: any[]    = [];
    let   p              = 1;

    if (name        !== undefined) { sets.push(`name = $${p++}`);        vals.push(name); }
    if (breed       !== undefined) { sets.push(`breed = $${p++}`);       vals.push(breed); }
    if (gender      !== undefined) { sets.push(`gender = $${p++}`);      vals.push(gender); }
    if (dob         !== undefined) { sets.push(`dob = $${p++}`);         vals.push(dob || null); }
    if (lifeStage   !== undefined) { sets.push(`life_stage = $${p++}`);  vals.push(lifeStage); }
    if (personality !== undefined) { sets.push(`personality = $${p++}`); vals.push(personality); }

    if (sets.length === 0) { res.status(400).json({ message: "No updates provided" }); return; }
    sets.push(`updated_at = NOW()`);
    vals.push(id);

    const { rows } = await pool.query(
      `UPDATE dogs SET ${sets.join(", ")} WHERE id = $${p}
       RETURNING
         id, name, gender, breed, dob,
         life_stage  AS "lifeStage",
         personality,
         avatar_url  AS "avatarUrl",
         is_main     AS "isMain"`,
      vals
    );
    res.json({ dog: rows[0] });
  } catch (err) {
    console.error("PATCH /dogs/:id error:", err);
    res.status(500).json({ message: "Failed to update dog" });
  }
});

// DELETE /api/dogs/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { rows: check } = await pool.query(
      "SELECT user_id, is_main FROM dogs WHERE id = $1",
      [id]
    );
    if (check.length === 0)          { res.status(404).json({ message: "Dog not found" }); return; }
    if (check[0].user_id !== userId) { res.status(403).json({ message: "Not authorized" }); return; }
    if (check[0].is_main)            { res.status(400).json({ message: "Cannot delete your primary dog" }); return; }
    await pool.query("DELETE FROM dogs WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /dogs/:id error:", err);
    res.status(500).json({ message: "Failed to delete dog" });
  }
});

// POST /api/dogs/:id/avatar
router.post("/:id/avatar", authenticate, upload.single("avatar"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    if (!(await ownsDog(userId, id))) { res.status(403).json({ message: "Not authorized" }); return; }
    if (!req.file)                    { res.status(400).json({ message: "No file uploaded" }); return; }

    // Build absolute URL so the frontend can use it directly in <img src>
    // Works both locally (http://localhost:4000) and on FastPanda (your domain)
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host     = req.headers["x-forwarded-host"]  || req.get("host");
    const avatarUrl = `${protocol}://${host}/uploads/dogs/${req.file.filename}`;

    await pool.query(
      "UPDATE dogs SET avatar_url = $1, updated_at = NOW() WHERE id = $2",
      [avatarUrl, id]
    );
    res.json({ avatarUrl });
  } catch (err) {
    console.error("POST /dogs/:id/avatar error:", err);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
});

// GET /api/dogs/:id/details
router.get("/:id/details", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    if (!(await ownsDog(userId, id))) { res.status(403).json({ message: "Not authorized" }); return; }
    const { rows } = await pool.query(
      `SELECT
         weight,
         body_condition  AS "bodyCondition",
         activity_level  AS "activityLevel",
         neutered,
         allergies,
         health_issues   AS "healthIssues",
         medications,
         eating_style    AS "eatingStyle",
         treats_per_day  AS "treatsPerDay",
         feeding_times   AS "feedingTimes"
       FROM dog_details
       WHERE dog_id = $1`,
      [id]
    );
    res.json({ details: rows[0] ?? {} });
  } catch (err) {
    console.error("GET /dogs/:id/details error:", err);
    res.status(500).json({ message: "Failed to fetch details" });
  }
});

// PUT /api/dogs/:id/details
router.put("/:id/details", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    if (!(await ownsDog(userId, id))) { res.status(403).json({ message: "Not authorized" }); return; }

    const {
      weight, bodyCondition, activityLevel, neutered,
      allergies, healthIssues, medications,
      eatingStyle, treatsPerDay, feedingTimes,
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO dog_details
         (dog_id, weight, body_condition, activity_level, neutered,
          allergies, health_issues, medications,
          eating_style, treats_per_day, feeding_times, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
       ON CONFLICT (dog_id) DO UPDATE SET
         weight         = EXCLUDED.weight,
         body_condition = EXCLUDED.body_condition,
         activity_level = EXCLUDED.activity_level,
         neutered       = EXCLUDED.neutered,
         allergies      = EXCLUDED.allergies,
         health_issues  = EXCLUDED.health_issues,
         medications    = EXCLUDED.medications,
         eating_style   = EXCLUDED.eating_style,
         treats_per_day = EXCLUDED.treats_per_day,
         feeding_times  = EXCLUDED.feeding_times,
         updated_at     = NOW()
       RETURNING
         weight,
         body_condition  AS "bodyCondition",
         activity_level  AS "activityLevel",
         neutered, allergies,
         health_issues   AS "healthIssues",
         medications,
         eating_style    AS "eatingStyle",
         treats_per_day  AS "treatsPerDay",
         feeding_times   AS "feedingTimes"`,
      [id, weight, bodyCondition, activityLevel, neutered,
       allergies, healthIssues, medications,
       eatingStyle, treatsPerDay, feedingTimes]
    );
    res.json({ details: rows[0] });
  } catch (err) {
    console.error("PUT /dogs/:id/details error:", err);
    res.status(500).json({ message: "Failed to save details" });
  }
});

export default router;