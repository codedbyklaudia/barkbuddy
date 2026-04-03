import { Router, Response } from "express";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /api/saved
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, type, item_id AS "itemId", title, summary, category,
              icon, address, distance, rating,
              saved_at AS "savedAt"
       FROM saved_items
       WHERE user_id = $1
       ORDER BY saved_at DESC`,
      [req.user!.userId]
    );
    res.json({ items: result.rows });
  } catch (err) {
    console.error("GET /saved error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// POST /api/saved
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, itemId, title, summary, category, icon, address, distance, rating } = req.body;

    if (!type || !itemId || !title) {
      res.status(400).json({ message: "type, itemId and title are required" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO saved_items
         (user_id, type, item_id, title, summary, category, icon, address, distance, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (user_id, type, item_id) DO NOTHING
       RETURNING id, type, item_id AS "itemId", title, summary, category,
                 icon, address, distance, rating, saved_at AS "savedAt"`,
      [req.user!.userId, type, itemId, title, summary ?? null, category ?? null,
       icon ?? null, address ?? null, distance ?? null, rating ?? null]
    );

    if (result.rows.length === 0) {
      // Already exists — return it
      const existing = await pool.query(
        `SELECT id, type, item_id AS "itemId", title, summary, category,
                icon, address, distance, rating, saved_at AS "savedAt"
         FROM saved_items WHERE user_id = $1 AND type = $2 AND item_id = $3`,
        [req.user!.userId, type, itemId]
      );
      res.json({ item: existing.rows[0] });
      return;
    }

    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error("POST /saved error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// DELETE /api/saved/:id 
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "DELETE FROM saved_items WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user!.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json({ message: "Removed" });
  } catch (err) {
    console.error("DELETE /saved/:id error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// DELETE /api/saved 
router.delete("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query(
      "DELETE FROM saved_items WHERE user_id = $1",
      [req.user!.userId]
    );
    res.json({ message: "All saved items cleared" });
  } catch (err) {
    console.error("DELETE /saved error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;