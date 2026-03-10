import { Router, Response } from "express";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// ─── GET /api/forum/posts ─────────────────────────────────────────────────────
// Returns posts with live comment count and createdAt in UTC ISO text.
router.get("/posts", async (req: any, res: Response): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT
        fp.id,
        fp.title,
        fp.content,
        fp.category,
        fp.is_published                          AS "isPublished",
        (fp.created_at AT TIME ZONE 'UTC')::text AS "createdAt",
        (fp.updated_at AT TIME ZONE 'UTC')::text AS "updatedAt",
        u.name                                   AS "userName",
        u.avatar_url                             AS "userAvatar",
        u.id                                     AS "userId",
        -- Live count so it never drifts from the cached column
        (
          SELECT COUNT(*)::int
          FROM forum_comments fc
          WHERE fc.post_id = fp.id
        )                                        AS "commentsCount",
        COUNT(*) OVER()                          AS total_count
      FROM forum_posts fp
      JOIN users u ON u.id = fp.user_id
      WHERE fp.is_published = true
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (category && category !== "All") {
      query += ` AND fp.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (fp.title ILIKE $${paramCount} OR fp.content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY fp.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    const total = Number(result.rows[0]?.total_count ?? 0);
    const posts = result.rows.map(({ total_count, ...row }: any) => row);

    res.json({ posts, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("GET /forum/posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// ─── GET /api/forum/posts/:id ─────────────────────────────────────────────────
router.get("/posts/:id", async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const postResult = await pool.query(
      `SELECT
         fp.id,
         fp.title,
         fp.content,
         fp.category,
         fp.is_published                          AS "isPublished",
         (fp.created_at AT TIME ZONE 'UTC')::text AS "createdAt",
         (fp.updated_at AT TIME ZONE 'UTC')::text AS "updatedAt",
         u.name                                   AS "userName",
         u.avatar_url                             AS "userAvatar",
         u.id                                     AS "userId",
         (
           SELECT COUNT(*)::int
           FROM forum_comments fc
           WHERE fc.post_id = fp.id
         )                                        AS "commentsCount"
       FROM forum_posts fp
       JOIN users u ON u.id = fp.user_id
       WHERE fp.id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const commentsResult = await pool.query(
      `SELECT
         fc.id,
         fc.content,
         (fc.created_at AT TIME ZONE 'UTC')::text AS "createdAt",
         u.name                                   AS "userName",
         u.avatar_url                             AS "userAvatar",
         u.id                                     AS "userId",
         fc.parent_id                             AS "parentId",
         COALESCE(
           (SELECT COUNT(*)::int FROM comment_likes WHERE comment_id = fc.id), 0
         )                                        AS "likesCount",
         EXISTS(
           SELECT 1 FROM comment_likes
           WHERE comment_id = fc.id AND user_id = $2
         )                                        AS "likedByMe"
       FROM forum_comments fc
       JOIN users u ON u.id = fc.user_id
       WHERE fc.post_id = $1
       ORDER BY fc.created_at ASC`,
      [id, req.user?.userId || null]
    );

    res.json({ post: postResult.rows[0], comments: commentsResult.rows });
  } catch (err) {
    console.error("GET /forum/posts/:id error:", err);
    res.status(500).json({ message: "Failed to fetch post" });
  }
});

// ─── GET /api/forum/my-posts ──────────────────────────────────────────────────
router.get("/my-posts", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT
         fp.id,
         fp.title,
         fp.content,
         fp.category,
         fp.is_published                          AS "isPublished",
         (fp.created_at AT TIME ZONE 'UTC')::text AS "createdAt",
         (fp.updated_at AT TIME ZONE 'UTC')::text AS "updatedAt",
         (
           SELECT COUNT(*)::int
           FROM forum_comments fc
           WHERE fc.post_id = fp.id
         )                                        AS "commentsCount"
       FROM forum_posts fp
       WHERE fp.user_id = $1
       ORDER BY fp.created_at DESC`,
      [req.user!.userId]
    );

    res.json({ posts: result.rows });
  } catch (err) {
    console.error("GET /forum/my-posts error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ─── POST /api/forum/posts ────────────────────────────────────────────────────
router.post("/posts", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO forum_posts (user_id, title, content, category, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, NOW(), NOW())
       RETURNING
         id,
         title,
         content,
         category,
         is_published                          AS "isPublished",
         0::int                               AS "commentsCount",
         (created_at AT TIME ZONE 'UTC')::text AS "createdAt",
         (updated_at AT TIME ZONE 'UTC')::text AS "updatedAt"`,
      [req.user!.userId, title, content, category]
    );

    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    console.error("POST /forum/posts error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// ─── PATCH /api/forum/posts/:id ───────────────────────────────────────────────
router.patch("/posts/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, category, isPublished } = req.body;

    const checkResult = await pool.query(
      "SELECT user_id FROM forum_posts WHERE id = $1",
      [id]
    );
    if (checkResult.rows.length === 0) { res.status(404).json({ message: "Post not found" }); return; }
    if (checkResult.rows[0].user_id !== req.user!.userId) { res.status(403).json({ message: "Not authorized" }); return; }

    const updates: string[] = [];
    const values:  any[]    = [];
    let   p = 1;

    if (title       !== undefined) { updates.push(`title = $${p}`);        values.push(title);       p++; }
    if (content     !== undefined) { updates.push(`content = $${p}`);      values.push(content);     p++; }
    if (category    !== undefined) { updates.push(`category = $${p}`);     values.push(category);    p++; }
    if (isPublished !== undefined) { updates.push(`is_published = $${p}`); values.push(isPublished); p++; }

    if (updates.length === 0) { res.status(400).json({ message: "No updates provided" }); return; }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE forum_posts
       SET ${updates.join(", ")}
       WHERE id = $${p}
       RETURNING
         id, title, content, category,
         is_published                          AS "isPublished",
         (created_at AT TIME ZONE 'UTC')::text AS "createdAt",
         (updated_at AT TIME ZONE 'UTC')::text AS "updatedAt"`,
      values
    );

    res.json({ post: result.rows[0] });
  } catch (err) {
    console.error("PATCH /forum/posts/:id error:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
});

// ─── DELETE /api/forum/posts/:id ──────────────────────────────────────────────
router.delete("/posts/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query("SELECT user_id FROM forum_posts WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) { res.status(404).json({ message: "Post not found" }); return; }
    if (checkResult.rows[0].user_id !== req.user!.userId) { res.status(403).json({ message: "Not authorized" }); return; }

    await pool.query("DELETE FROM forum_comments WHERE post_id = $1", [id]);
    await pool.query("DELETE FROM forum_posts    WHERE id      = $1", [id]);

    res.status(204).send();
  } catch (err) {
    console.error("DELETE /forum/posts/:id error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

// ─── POST /api/forum/posts/:id/comments ──────────────────────────────────────
router.post("/posts/:id/comments", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id }                  = req.params;
    const { content, parent_id }  = req.body;

    if (!content) { res.status(400).json({ message: "Comment content required" }); return; }

    // Keep the cached counter in sync
    await pool.query(
      `UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = $1`,
      [id]
    );

    const result = await pool.query(
      `INSERT INTO forum_comments (post_id, user_id, content, parent_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING
         id,
         content,
         parent_id                             AS "parentId",
         user_id                               AS "userId",
         (created_at AT TIME ZONE 'UTC')::text AS "createdAt"`,
      [id, req.user!.userId, content, parent_id || null]
    );

    const userResult = await pool.query(
      "SELECT name AS \"userName\", avatar_url AS \"userAvatar\" FROM users WHERE id = $1",
      [req.user!.userId]
    );

    res.status(201).json({
      comment: {
        ...result.rows[0],
        ...userResult.rows[0],
        likesCount: 0,
        likedByMe:  false,
        replies:    [],
      },
    });
  } catch (err) {
    console.error("POST /forum/posts/:id/comments error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// ─── DELETE /api/forum/comments/:id ──────────────────────────────────────────
router.delete("/comments/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query(
      "SELECT user_id, post_id FROM forum_comments WHERE id = $1", [id]
    );
    if (checkResult.rows.length === 0) { res.status(404).json({ message: "Comment not found" }); return; }
    if (checkResult.rows[0].user_id !== req.user!.userId) { res.status(403).json({ message: "Not authorized" }); return; }

    await pool.query(
      `UPDATE forum_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = $1`,
      [checkResult.rows[0].post_id]
    );
    await pool.query("DELETE FROM forum_comments WHERE id = $1", [id]);

    res.status(204).send();
  } catch (err) {
    console.error("DELETE /forum/comments/:id error:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

// ─── POST /api/forum/comments/:id/like ───────────────────────────────────────
router.post("/comments/:id/like", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id }   = req.params;
    const userId   = req.user!.userId;

    const existing = await pool.query(
      `SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2`, [id, userId]
    );
    if (existing.rows.length > 0) {
      res.status(200).json({ liked: true, isDuplicate: true });
      return;
    }

    await pool.query(
      `INSERT INTO comment_likes (comment_id, user_id, created_at) VALUES ($1, $2, NOW())`,
      [id, userId]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS "likesCount" FROM comment_likes WHERE comment_id = $1`, [id]
    );

    res.status(201).json({ liked: true, isDuplicate: false, likesCount: countResult.rows[0].likesCount });
  } catch (err) {
    console.error("POST /comments/:id/like error:", err);
    res.status(500).json({ message: "Failed to like comment" });
  }
});

// ─── DELETE /api/forum/comments/:id/like ─────────────────────────────────────
router.delete("/comments/:id/like", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await pool.query(
      `DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2`, [id, userId]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS "likesCount" FROM comment_likes WHERE comment_id = $1`, [id]
    );

    res.status(200).json({ liked: false, likesCount: countResult.rows[0].likesCount });
  } catch (err) {
    console.error("DELETE /comments/:id/like error:", err);
    res.status(500).json({ message: "Failed to unlike comment" });
  }
});

// ─── GET /api/forum/categories ────────────────────────────────────────────────
router.get("/categories", async (req: any, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT category FROM forum_posts WHERE is_published = true ORDER BY category ASC`
    );
    res.json({ categories: result.rows.map((r: any) => r.category) });
  } catch (err) {
    console.error("GET /forum/categories error:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

export default router;