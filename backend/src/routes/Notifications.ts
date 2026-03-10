import { Router, Response } from "express";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/notifications
router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         type,
         actor_name,
         actor_avatar,
         post_id,
         post_title,
         comment_snippet,
         is_read,
         created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user!.userId]
    );

    // Also return unread count so the badge stays accurate
    const unreadResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false",
      [req.user!.userId]
    );

    res.json({
      notifications: result.rows,
      unread_count:  unreadResult.rows[0].count,
    });
  } catch (err) {
    console.error("GET /notifications error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// PATCH /api/notifications/read 
router.patch("/read", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { ids } = req.body as { ids?: string[] };

  try {
    if (ids && ids.length > 0) {
      // Mark specific ones — only if they belong to this user
      await pool.query(
        `UPDATE notifications
         SET is_read = true
         WHERE id = ANY($1::uuid[]) AND user_id = $2`,
        [ids, req.user!.userId]
      );
    } else {
      // Mark all as read
      await pool.query(
        "UPDATE notifications SET is_read = true WHERE user_id = $1",
        [req.user!.userId]
      );
    }

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("PATCH /notifications/read error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// DELETE /api/notifications/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user!.userId]
    );
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;