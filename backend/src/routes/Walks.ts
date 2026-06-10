import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import pool from "../db";

const router = Router();

// Returns the new streak so the response can include it
const updateStreak = async (userId: string): Promise<number> => {
const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const result = await pool.query(
`SELECT streak, last_walk_date::text AS last_walk_date FROM users WHERE id = $1`,
[userId]
);

const row = result.rows[0];
const lastDate = row.last_walk_date ?? null;

if (lastDate === today) return row.streak ?? 0; // already walked today

const newStreak = lastDate === yesterday
? (row.streak ?? 0) + 1
: 1;

await pool.query(
`UPDATE users SET streak = $1, last_walk_date = $2::date WHERE id = $3`,
[newStreak, today, userId]
);

return newStreak;
};

// Export so profile route can call it on GET /api/profile
export const resetStreakIfStale = async (userId: string): Promise<void> => {
const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const result = await pool.query(
`SELECT streak, last_walk_date::text AS last_walk_date FROM users WHERE id = $1`,
[userId]
);

const row = result.rows[0];
const lastDate = row.last_walk_date ?? null;

// If last walk was not today or yesterday, streak is dead → reset to 0
if (lastDate !== today && lastDate !== yesterday && row.streak > 0) {
await pool.query(
`UPDATE users SET streak = 0 WHERE id = $1`,
[userId]
);
}
};

// POST /api/walks
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
const userId = req.user!.userId;
const { dog_ids, started_at, ended_at, duration_seconds,
distance_km, steps, route, notes } = req.body;

if (!started_at || !distance_km) {
res.status(400).json({ error: "started_at and distance_km are required" });
return;
}

try {
const result = await pool.query(
`INSERT INTO walks
(user_id, dog_ids, started_at, ended_at, duration_seconds,
distance_km, steps, route, notes)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
RETURNING *`,
[userId, dog_ids || [], started_at, ended_at,
duration_seconds, distance_km, steps,
route ? JSON.stringify(route) : null, notes]
);

// Update streak and include new value in response
const newStreak = await updateStreak(userId);

res.status(201).json({ walk: result.rows[0], streak: newStreak });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Failed to save walk" });
}
});

// GET /api/walks/stats
router.get("/stats", authenticate, async (req: AuthRequest, res: Response) => {
const userId = req.user!.userId;
const { month } = req.query;

try {
const monthParams: any[] = month ? [userId, month] : [userId];
const monthFilter = month
? `WHERE user_id = $1 AND TO_CHAR(started_at, 'YYYY-MM') = $2`
: `WHERE user_id = $1 AND TO_CHAR(started_at, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')`;

const monthStats = await pool.query(
`SELECT
COALESCE(SUM(distance_km), 0) AS total_km,
COALESCE(SUM(steps), 0) AS total_steps,
COALESCE(SUM(duration_seconds), 0) AS total_duration,
COUNT(*) AS total_walks
FROM walks ${monthFilter}`,
monthParams
);

const weekStats = await pool.query(
`SELECT
(started_at AT TIME ZONE 'UTC')::date AS walk_day,
COALESCE(SUM(distance_km), 0) AS day_km
FROM walks
WHERE user_id = $1
AND (started_at AT TIME ZONE 'UTC')::date >= DATE_TRUNC('week', CURRENT_DATE)
AND (started_at AT TIME ZONE 'UTC')::date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
GROUP BY walk_day
ORDER BY walk_day`,
[userId]
);

const goals = await pool.query(
`SELECT daily_km, monthly_km FROM walk_goals WHERE user_id = $1`,
[userId]
);

res.json({
monthly: monthStats.rows[0],
week: weekStats.rows,
goals: goals.rows[0] || { daily_km: 3.0, monthly_km: 93.0 },
});
} catch (err) {
console.error(err);
res.status(500).json({ error: "Failed to fetch stats" });
}
});

// GET /api/walks
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
const userId = req.user!.userId;
const limit = parseInt(req.query.limit as string) || 20;
const offset = parseInt(req.query.offset as string) || 0;

try {
const result = await pool.query(
`SELECT id, dog_ids, started_at, ended_at, duration_seconds,
distance_km, steps, notes
FROM walks
WHERE user_id = $1
ORDER BY started_at DESC
LIMIT $2 OFFSET $3`,
[userId, limit, offset]
);
res.json({ walks: result.rows });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Failed to fetch walks" });
}
});

// PUT /api/walks/goals
router.put("/goals", authenticate, async (req: AuthRequest, res: Response) => {
const userId = req.user!.userId;
const { daily_km, monthly_km } = req.body;

try {
await pool.query(
`INSERT INTO walk_goals (user_id, daily_km, monthly_km)
VALUES ($1, $2, $3)
ON CONFLICT (user_id) DO UPDATE
SET daily_km = $2, monthly_km = $3, updated_at = NOW()`,
[userId, daily_km || 3.0, monthly_km || 93.0]
);
res.json({ success: true });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Failed to update goals" });
}
});

// DELETE /api/walks/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
const userId = req.user!.userId;
try {
await pool.query(
`DELETE FROM walks WHERE id = $1 AND user_id = $2`,
[req.params.id, userId]
);
res.json({ success: true });
} catch (err) {
res.status(500).json({ error: "Failed to delete walk" });
}
});

export default router;