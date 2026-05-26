import { Router, Response } from "express";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// Shared builder 
async function buildProfile(targetUserId: string, requestingUserId: string) {

  // Core user — includes banner_url
  const userRes = await pool.query(
    `SELECT id, name, bio, avatar_url, banner_url, created_at, profile_complete
     FROM users WHERE id = $1`,
    [targetUserId]
  );
  if (!userRes.rowCount) return null;
  const u = userRes.rows[0];

  // ALL dogs — ordered main first
  const dogsRes = await pool.query(
    `SELECT name, breed, gender, dob,
            life_stage  AS "lifeStage",
            avatar_url  AS "avatarUrl",
            personality,
            is_main     AS "isMain"
     FROM dogs
     WHERE user_id = $1
     ORDER BY is_main DESC, created_at ASC`,
    [targetUserId]
  );

  const dogs = dogsRes.rows.map((dog: any) => ({
    name:        dog.name,
    breed:       dog.breed,
    gender:      dog.gender,
    dob:         dog.dob ?? null,
    lifeStage:   dog.lifeStage,
    avatarUrl:   dog.avatarUrl ?? null,
    isMain:      dog.isMain,
    personality: Array.isArray(dog.personality)
      ? dog.personality
      : (() => { try { return JSON.parse(dog.personality); } catch { return []; } })(),
  }));

  // Buddy count
  const buddyCountRes = await pool.query(
    `SELECT COUNT(*) AS count
     FROM buddy_requests
     WHERE status = 'accepted'
       AND (sender_id = $1 OR receiver_id = $1)`,
    [targetUserId]
  );
  const buddyCount = parseInt(buddyCountRes.rows[0].count, 10);

  // Published post count
  const postCountRes = await pool.query(
    `SELECT COUNT(*) AS count
     FROM forum_posts
     WHERE user_id = $1 AND is_published = true`,
    [targetUserId]
  );
  const postCount = parseInt(postCountRes.rows[0].count, 10);

  // Total likes received
  let likesReceived = 0;
  try {
    const likesRes = await pool.query(
      `SELECT COUNT(fpl.id) AS count
       FROM forum_post_likes fpl
       INNER JOIN forum_posts fp ON fp.id = fpl.post_id
       WHERE fp.user_id = $1
         AND fp.is_published = true`,
      [targetUserId]
    );
    likesReceived = parseInt(likesRes.rows[0].count, 10);
  } catch {
    likesReceived = 0;
  }

  return {
    id:              String(u.id),
    name:            u.name,
    bio:             u.bio ?? null,
    avatarUrl:       u.avatar_url ?? null,
    bannerUrl:       u.banner_url ?? null,
    createdAt:       u.created_at,
    profileComplete: u.profile_complete ?? 0,
    buddyCount,
    postCount,
    likesReceived,
    dogs,
    dog: dogs[0] ?? null,
  };
}

// GET /api/users/me/profile 
router.get("/me/profile", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await buildProfile(
      String(req.user!.userId),
      String(req.user!.userId)
    );
    if (!profile) { res.status(404).json({ message: "User not found" }); return; }
    res.json(profile);
  } catch (err) {
    console.error("GET /users/me/profile error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// GET /api/users/:userId/profile
router.get("/:userId/profile", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await buildProfile(
      req.params.userId,
      String(req.user!.userId)
    );
    if (!profile) { res.status(404).json({ message: "User not found" }); return; }

    // Strip private field before sending to another user
    const { profileComplete, ...publicProfile } = profile;
    res.json(publicProfile);
  } catch (err) {
    console.error("GET /users/:userId/profile error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;