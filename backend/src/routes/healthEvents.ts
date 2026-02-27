import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

const VALID_TYPES = ["vaccine", "flea_tick", "worming", "vet", "grooming", "custom"];

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT he.id, he.type, he.title, he.notes,
              he.due_date, he.completed, he.completed_at,
              he.created_at, he.updated_at
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

// Add a new health event
router.post("/", [
  body("type").isIn(VALID_TYPES).withMessage("Invalid event type"),
  body("title").trim().isLength({ min: 1, max: 150 }).withMessage("Title is required"),
  body("due_date").isDate().withMessage("Please provide a valid date"),
  body("notes").optional().trim(),
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

  const { type, title, notes, due_date } = req.body;

  try {
    // Get the user's dog id
    const dogResult = await pool.query(
      "SELECT id FROM dogs WHERE user_id = $1 LIMIT 1",
      [req.user!.userId]
    );

    if (dogResult.rows.length === 0) {
      res.status(404).json({ message: "No dog found for this user" });
      return;
    }

    const dogId = dogResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO health_events (dog_id, user_id, type, title, notes, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, type, title, notes, due_date, completed, completed_at, created_at`,
      [dogId, req.user!.userId, type, title, notes || null, due_date]
    );

    res.status(201).json({ event: result.rows[0] });
  } catch (err) {
    console.error("POST /health-events error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// Mark event as done or undone
router.patch("/:id/complete", async (req: AuthRequest, res: Response): Promise<void> => {
  const { completed } = req.body;

  try {
    const result = await pool.query(
      `UPDATE health_events
       SET completed = $1,
           completed_at = $2,
           updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, type, title, due_date, completed, completed_at`,
      [
        completed,
        completed ? new Date() : null,
        req.params.id,
        req.user!.userId,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.json({ event: result.rows[0] });
  } catch (err) {
    console.error("PATCH /health-events/:id/complete error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// Edit an event
router.patch("/:id", [
  body("title").optional().trim().isLength({ min: 1, max: 150 }),
  body("due_date").optional().isDate(),
  body("notes").optional().trim(),
], async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, due_date, notes } = req.body;

  try {
    const updates: string[] = [];
    const params: any[]     = [];

    const add = (field: string, val: any) => {
      params.push(val);
      updates.push(`${field} = $${params.length}`);
    };

    if (title)    add("title",    title);
    if (due_date) add("due_date", due_date);
    if (notes !== undefined) add("notes", notes);

    if (updates.length === 0) {
      res.status(400).json({ message: "No changes provided" });
      return;
    }

    params.push(req.params.id, req.user!.userId);

    const result = await pool.query(
      `UPDATE health_events
       SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${params.length - 1} AND user_id = $${params.length}
       RETURNING id, type, title, notes, due_date, completed, completed_at`,
      params
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.json({ event: result.rows[0] });
  } catch (err) {
    console.error("PATCH /health-events/:id error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

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