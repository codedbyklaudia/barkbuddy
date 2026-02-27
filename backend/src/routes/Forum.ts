import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

const CATEGORIES = ["General","Teething","Travel","Vets","Allergies","Training","Nutrition","Grooming","Dog-friendly","Health","Other"];

// GET /api/forum/posts 
router.get("/posts", async (req: any, res: Response): Promise<void> => {
  const { category, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions: string[] = [];
    const params: any[]        = [];

    if (category && category !== "All") {
      params.push(category);
      conditions.push(`fp.category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`fp.title ILIKE $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    params.push(parseInt(limit), offset);

    const result = await pool.query(
      `SELECT fp.id, fp.title, fp.category, fp.comments_count,
              fp.created_at, fp.updated_at,
              u.name AS user_name, u.avatar_url AS user_avatar
       FROM forum_posts fp
       JOIN users u ON u.id = fp.user_id
       ${where}
       ORDER BY fp.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    // Total count for pagination
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM forum_posts fp ${where}`,
      countParams
    );

    res.json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].count),
      page:  parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("GET /forum/posts error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

//  GET /api/forum/posts/:id 
router.get("/posts/:id", async (req: any, res: Response): Promise<void> => {
  try {
    const postResult = await pool.query(
      `SELECT fp.id, fp.title, fp.content, fp.category, fp.comments_count,
              fp.created_at, fp.updated_at,
              u.name AS user_name, u.avatar_url AS user_avatar, fp.user_id
       FROM forum_posts fp
       JOIN users u ON u.id = fp.user_id
       WHERE fp.id = $1`,
      [req.params.id]
    );

    if (postResult.rows.length === 0) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const commentsResult = await pool.query(
      `SELECT fc.id, fc.content, fc.created_at,
              u.name AS user_name, u.avatar_url AS user_avatar, fc.user_id
       FROM forum_comments fc
       JOIN users u ON u.id = fc.user_id
       WHERE fc.post_id = $1
       ORDER BY fc.created_at ASC`,
      [req.params.id]
    );

    res.json({
      post:     postResult.rows[0],
      comments: commentsResult.rows,
    });
  } catch (err) {
    console.error("GET /forum/posts/:id error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// Auth required - create post
router.post("/posts", authenticate, [
  body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title must be 3–200 characters"),
  body("content").trim().isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
  body("category").isIn(CATEGORIES).withMessage("Invalid category"),
], async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.array().reduce((acc: Record<string, string>, err: any) => {
        acc[err.path] = err.msg; return acc;
      }, {}),
    });
    return;
  }

  const { title, content, category } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO forum_posts (user_id, title, content, category)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, content, category, comments_count, created_at`,
      [req.user!.userId, title, content, category]
    );

    // Attach author info
    const userResult = await pool.query(
      "SELECT name, avatar_url FROM users WHERE id = $1",
      [req.user!.userId]
    );

    res.status(201).json({
      post: {
        ...result.rows[0],
        user_name:   userResult.rows[0]?.name,
        user_avatar: userResult.rows[0]?.avatar_url,
      },
    });
  } catch (err) {
    console.error("POST /forum/posts error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});


router.delete("/posts/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "DELETE FROM forum_posts WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user!.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Post not found or not authorised" });
      return;
    }
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("DELETE /forum/posts/:id error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});


router.post("/posts/:id/comments", authenticate, [
  body("content").trim().isLength({ min: 1 }).withMessage("Comment cannot be empty"),
], async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Comment cannot be empty" });
    return;
  }

  try {
    // Check post exists
    const postCheck = await pool.query("SELECT id FROM forum_posts WHERE id = $1", [req.params.id]);
    if (postCheck.rows.length === 0) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO forum_comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [req.params.id, req.user!.userId, req.body.content]
    );

    const userResult = await pool.query(
      "SELECT name, avatar_url FROM users WHERE id = $1",
      [req.user!.userId]
    );

    res.status(201).json({
      comment: {
        ...result.rows[0],
        user_id:     req.user!.userId,
        user_name:   userResult.rows[0]?.name,
        user_avatar: userResult.rows[0]?.avatar_url,
      },
    });
  } catch (err) {
    console.error("POST /forum/posts/:id/comments error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});


router.delete("/comments/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "DELETE FROM forum_comments WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user!.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Not found or not authorised" });
      return;
    }
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;