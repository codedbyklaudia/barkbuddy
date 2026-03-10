import { Router, Request, Response } from "express";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// ─── GET /api/reviews/business/:businessId ────────────────────────────────────
// Public — no auth needed to read reviews
router.get("/business/:businessId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;

    const reviewsResult = await pool.query(
      `SELECT
         r.id,
         r.user_name,
         r.rating,
         r.comment,
         r.created_at
       FROM reviews r
       WHERE r.business_id = $1
         AND r.deleted_at IS NULL
       ORDER BY r.created_at DESC`,
      [businessId]
    );

    const statsResult = await pool.query(
      `SELECT
         COALESCE(AVG(rating), 0)::NUMERIC(3,2) AS average_rating,
         COUNT(*)::INT                           AS total_reviews
       FROM reviews
       WHERE business_id = $1
         AND deleted_at IS NULL`,
      [businessId]
    );

    res.json({
      reviews:    reviewsResult.rows,
      statistics: statsResult.rows[0] ?? { average_rating: 0, total_reviews: 0 },
    });
  } catch (err) {
    console.error("GET /reviews/business/:id error:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Requires auth — pulls user name from the verified JWT via authenticate middleware
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { business_id, rating, comment } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!business_id || !rating || !comment) {
      res.status(400).json({ error: "business_id, rating and comment are required" });
      return;
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
      return;
    }

    if (comment.trim().length < 10) {
      res.status(400).json({ error: "Comment must be at least 10 characters" });
      return;
    }

    // ── Get user's name from the database using the userId in the JWT ─────────
    // req.user is set by the authenticate middleware and contains { userId, email }
    const userResult = await pool.query(
      "SELECT name, email FROM users WHERE id = $1",
      [req.user!.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const { name: user_name, email: user_email } = userResult.rows[0];

    // ── Verify the business exists ────────────────────────────────────────────
    const businessCheck = await pool.query(
      "SELECT id FROM business_accounts WHERE id = $1 AND deleted_at IS NULL",
      [business_id]
    );

    if (businessCheck.rows.length === 0) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    // ── Prevent duplicate reviews from the same user ──────────────────────────
    const duplicateCheck = await pool.query(
      `SELECT id FROM reviews
       WHERE business_id = $1
         AND user_id = $2
         AND deleted_at IS NULL`,
      [business_id, req.user!.userId]
    );

    if (duplicateCheck.rows.length > 0) {
      res.status(409).json({ error: "You have already reviewed this business" });
      return;
    }

    // ── Insert review ─────────────────────────────────────────────────────────
    const result = await pool.query(
      `INSERT INTO reviews
         (business_id, user_id, user_name, user_email, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, user_name, rating, comment, created_at`,
      [business_id, req.user!.userId, user_name, user_email, ratingNum, comment.trim()]
    );

    res.status(201).json({
      message: "Review submitted successfully",
      review:  result.rows[0],   // includes user_name from DB — never Anonymous
    });
  } catch (err) {
    console.error("POST /reviews error:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// ─── DELETE /api/reviews/:reviewId ────────────────────────────────────────────
// Users can only delete their own reviews
router.delete("/:reviewId", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;

    const result = await pool.query(
      `UPDATE reviews
       SET deleted_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND deleted_at IS NULL
       RETURNING id`,
      [reviewId, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Review not found or not yours to delete" });
      return;
    }

    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("DELETE /reviews/:id error:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;