import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

const VALID_TYPES = ["vaccine", "flea_tick", "worming", "vet", "grooming", "custom"];

// ─── GET all events ───────────────────────────────────────────────────────────
// due_date::text prevents pg driver converting DATE → UTC midnight JS Date,
// which in BST (UTC+1) would roll the day back by 1.
// Now also returns dog_id, dog_name so the frontend can colour-code per dog.
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT he.id, he.dog_id, he.type, he.title, he.notes,
              he.due_date::text,
              he.completed, he.completed_at,
              he.created_at, he.updated_at,
              d.name     AS dog_name,
              d.is_main  AS dog_is_main
       FROM health_events he
       JOIN dogs d ON d.id = he.dog_id
       WHERE he.user_id = $1
       ORDER BY he.due_date ASC`,
      [req.user!.userId]
    );
    res.json({ events: result.rows });
  } catch (err) {
    console.error("GET /health-events error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── POST — add a new health event ───────────────────────────────────────────
// Now accepts optional dog_id. Falls back to the user's primary dog if omitted
// (keeps backward compat with any old clients that don't send dog_id yet).
router.post("/", [
  body("type").isIn(VALID_TYPES).withMessage("Invalid event type"),
  body("title").trim().isLength({ min: 1, max: 150 }).withMessage("Title is required"),
  body("due_date").isDate().withMessage("Please provide a valid date"),
  body("notes").optional().trim(),
  body("dog_id").optional().isUUID().withMessage("Invalid dog_id"),
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

  const { type, title, notes, due_date, dog_id } = req.body;

  try {
    let resolvedDogId = dog_id;

    if (!resolvedDogId) {
      // Fallback: use primary dog (or first dog) — keeps old behaviour intact
      const dogResult = await pool.query(
        "SELECT id FROM dogs WHERE user_id = $1 ORDER BY is_main DESC, created_at ASC LIMIT 1",
        [req.user!.userId]
      );
      if (dogResult.rows.length === 0) {
        res.status(404).json({ message: "No dog found for this user" });
        return;
      }
      resolvedDogId = dogResult.rows[0].id;
    } else {
      // Verify the specified dog belongs to this user
      const dogCheck = await pool.query(
        "SELECT id FROM dogs WHERE id = $1 AND user_id = $2",
        [resolvedDogId, req.user!.userId]
      );
      if (dogCheck.rows.length === 0) {
        res.status(404).json({ message: "Dog not found" });
        return;
      }
    }

    const result = await pool.query(
      `INSERT INTO health_events (dog_id, user_id, type, title, notes, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, dog_id, type, title, notes,
                 due_date::text,
                 completed, completed_at, created_at`,
      [resolvedDogId, req.user!.userId, type, title, notes || null, due_date]
    );

    // Fetch dog name to return with event
    const dogRes = await pool.query(
      "SELECT name, is_main FROM dogs WHERE id = $1",
      [resolvedDogId]
    );

    res.status(201).json({
      event: {
        ...result.rows[0],
        dog_name:    dogRes.rows[0]?.name,
        dog_is_main: dogRes.rows[0]?.is_main,
      },
    });
  } catch (err) {
    console.error("POST /health-events error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── PATCH /:id/complete — mark done / undone ─────────────────────────────────
router.patch("/:id/complete", async (req: AuthRequest, res: Response): Promise<void> => {
  const { completed } = req.body;

  try {
    const result = await pool.query(
      `UPDATE health_events
       SET completed    = $1,
           completed_at = $2,
           updated_at   = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, dog_id, type, title,
                 due_date::text,
                 completed, completed_at`,
      [completed, completed ? new Date() : null, req.params.id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const dogRes = await pool.query(
      "SELECT name, is_main FROM dogs WHERE id = $1",
      [result.rows[0].dog_id]
    );

    res.json({
      event: {
        ...result.rows[0],
        dog_name:    dogRes.rows[0]?.name,
        dog_is_main: dogRes.rows[0]?.is_main,
      },
    });
  } catch (err) {
    console.error("PATCH /health-events/:id/complete error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── PATCH /:id — edit title / due_date / notes / dog_id ─────────────────────
router.patch("/:id", [
  body("title").optional().trim().isLength({ min: 1, max: 150 }),
  body("due_date").optional().isDate(),
  body("notes").optional().trim(),
  body("dog_id").optional().isUUID(),
], async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, due_date, notes, dog_id } = req.body;

  try {
    const updates: string[] = [];
    const params: any[]     = [];

    const add = (field: string, val: any) => {
      params.push(val);
      updates.push(`${field} = $${params.length}`);
    };

    if (title    !== undefined) add("title",    title);
    if (due_date !== undefined) add("due_date", due_date);
    if (notes    !== undefined) add("notes",    notes);
    if (dog_id   !== undefined) add("dog_id",   dog_id);

    if (updates.length === 0) {
      res.status(400).json({ message: "No changes provided" });
      return;
    }

    params.push(req.params.id, req.user!.userId);

    const result = await pool.query(
      `UPDATE health_events
       SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${params.length - 1} AND user_id = $${params.length}
       RETURNING id, dog_id, type, title, notes,
                 due_date::text,
                 completed, completed_at`,
      params
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const dogRes = await pool.query(
      "SELECT name, is_main FROM dogs WHERE id = $1",
      [result.rows[0].dog_id]
    );

    res.json({
      event: {
        ...result.rows[0],
        dog_name:    dogRes.rows[0]?.name,
        dog_is_main: dogRes.rows[0]?.is_main,
      },
    });
  } catch (err) {
    console.error("PATCH /health-events/:id error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// DELETE /:id 
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "DELETE FROM health_events WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("DELETE /health-events error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;