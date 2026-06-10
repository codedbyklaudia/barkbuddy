import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";
import multer from "multer";
import { uploadToCloudinary } from "../lib/uploadCloudinary";

const router = Router();

const memStorage = multer.memoryStorage();

const imageFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
if (file.mimetype.startsWith("image/")) cb(null, true);
else cb(new Error("Only image files are allowed"));
};

const uploadUserAvatar = multer({ storage: memStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });
const uploadUserBanner = multer({ storage: memStorage, limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: imageFilter });
const uploadDogAvatar = multer({ storage: memStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });

// Helper: recalculate profile_complete
const calcProfileComplete = (user: {
name?: string; bio?: string; avatar_url?: string;
}, hasDog: boolean, dogHasPersonality: boolean): number => {
let score = 0;
if (user.name?.trim()) score += 20;
if (user.bio?.trim()) score += 20;
if (user.avatar_url) score += 20;
if (hasDog) score += 20;
if (dogHasPersonality) score += 20;
return score;
};

// Helper: reset streak to 0 if no walk in last 24h
const resetStreakIfStale = async (userId: string): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const result = await pool.query(
    `SELECT streak, last_walk_date::text AS last_walk_date FROM users WHERE id = $1`,
    [userId]
  );

  const row      = result.rows[0];
  const lastDate = row.last_walk_date ?? null;

  // If last walk wasn't today → reset
  if (lastDate !== today && (row.streak ?? 0) > 0) {
    await pool.query(
      `UPDATE users SET streak = 0, last_walk_date = NULL WHERE id = $1`,
      [userId]
    );
  }
};

// Helper: update streak on walk
export async function updateStreak(userId: string): Promise<void> {
  const today     = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const result = await pool.query(
    `SELECT last_walk_date::text AS last_walk_date, streak FROM users WHERE id = $1`,
    [userId]
  );

  const { last_walk_date, streak } = result.rows[0];

  if (last_walk_date === today) return; // already walked today

  // Only continue streak if walked yesterday, otherwise start fresh at 1
  const newStreak = last_walk_date === yesterday ? (streak ?? 0) + 1 : 1;

  await pool.query(
    `UPDATE users SET streak = $1, last_walk_date = $2 WHERE id = $3`,
    [newStreak, today, userId]
  );
}

// All routes require auth
router.use(authenticate);

// GET /api/users/me
router.get("/me", async (req: AuthRequest, res: Response): Promise<void> => {
try {
const userId = req.user!.userId;

// Reset streak if no walk today or yesterday
await resetStreakIfStale(userId);

const userResult = await pool.query(
`SELECT id, name, email, bio, profile_complete, avatar_url, banner_url, streak,
status, email_notifications, preferences, created_at, updated_at
FROM users WHERE id = $1`,
[userId]
);

if (userResult.rows.length === 0) {
res.status(404).json({ message: "User not found" });
return;
}

const user = userResult.rows[0];

const dogResult = await pool.query(
`SELECT
id, name, gender, breed, dob,
life_stage AS "lifeStage",
personality,
avatar_url AS "avatarUrl",
is_main AS "isMain"
FROM dogs
WHERE user_id = $1
ORDER BY is_main DESC, created_at ASC
LIMIT 1`,
[user.id]
);

const dog = dogResult.rows[0] ?? null;

res.json({
user: {
id: user.id,
name: user.name,
email: user.email,
bio: user.bio ?? "",
profileComplete: user.profile_complete,
avatarUrl: user.avatar_url,
bannerUrl: user.banner_url ?? null,
emailNotifications: user.email_notifications,
streak: user.streak ?? 0,
preferences: user.preferences || {},
createdAt: user.created_at,
updatedAt: user.updated_at,
},
dog,
});
} catch (err) {
console.error("GET /users/me error:", err);
res.status(500).json({ message: "Something went wrong." });
}
});

// PATCH /api/users/me
router.patch("/me", [
body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),
body("email").optional().isEmail().withMessage("Please enter a valid email").normalizeEmail(),
body("bio").optional().trim().isLength({ max: 200 }).withMessage("Bio must be 200 characters or less"),
body("currentPassword").optional().notEmpty().withMessage("Current password is required to change password"),
body("newPassword").optional()
.isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
.matches(/[A-Z]/).withMessage("Must contain an uppercase letter")
.matches(/[0-9]/).withMessage("Must contain a number"),
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

const { name, email, bio, currentPassword, newPassword } = req.body;
const userId = req.user!.userId;

try {
const userResult = await pool.query(
"SELECT id, name, email, bio, profile_complete, avatar_url, banner_url, streak, email_notifications, preferences, created_at, updated_at FROM users WHERE id = $1",
[userId]
);
const user = userResult.rows[0];

if (newPassword) {
if (!currentPassword) {
res.status(400).json({ message: "Validation failed", errors: { currentPassword: "Current password is required to set a new password" } });
return;
}
const valid = await bcrypt.compare(currentPassword, user.password_hash);
if (!valid) {
res.status(400).json({ message: "Validation failed", errors: { currentPassword: "Current password is incorrect" } });
return;
}
}

if (email && email !== user.email) {
const existing = await pool.query(
"SELECT id FROM users WHERE email = $1 AND id != $2",
[email, userId]
);
if (existing.rows.length > 0) {
res.status(409).json({ message: "Validation failed", errors: { email: "This email is already in use" } });
return;
}
}

const updates: string[] = [];
const params: any[] = [];
const addUpdate = (field: string, val: any) => { params.push(val); updates.push(`${field} = $${params.length}`); };

if (name) addUpdate("name", name);
if (email) addUpdate("email", email);
if (bio !== undefined) addUpdate("bio", bio.trim());
if (newPassword) addUpdate("password_hash", await bcrypt.hash(newPassword, 12));

if (updates.length === 0) { res.status(400).json({ message: "No changes provided" }); return; }

params.push(userId);
const result = await pool.query(
`UPDATE users SET ${updates.join(", ")}, updated_at = NOW()
WHERE id = $${params.length}
RETURNING id, name, email, bio, avatar_url, banner_url, profile_complete, updated_at`,
params
);

const updatedUser = result.rows[0];

const dogResult = await pool.query(
"SELECT id, personality FROM dogs WHERE user_id = $1 LIMIT 1",
[userId]
);
const dog = dogResult.rows[0] ?? null;
const newProfileComplete = calcProfileComplete(
{ name: updatedUser.name, bio: updatedUser.bio, avatar_url: updatedUser.avatar_url },
!!dog,
!!(dog?.personality?.length)
);
await pool.query("UPDATE users SET profile_complete = $1 WHERE id = $2", [newProfileComplete, userId]);

res.json({
message: "Profile updated successfully",
user: {
id: updatedUser.id,
name: updatedUser.name,
email: updatedUser.email,
bio: updatedUser.bio ?? "",
profileComplete: newProfileComplete,
avatarUrl: updatedUser.avatar_url,
bannerUrl: updatedUser.banner_url ?? null,
updatedAt: updatedUser.updated_at,
},
});
} catch (err) {
console.error("PATCH /users/me error:", err);
res.status(500).json({ message: "Something went wrong." });
}
});

// DELETE /api/users/me
router.delete("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
const client = await pool.connect();
try {
await client.query("BEGIN");
await client.query("DELETE FROM dogs WHERE user_id = $1", [req.user!.userId]);
await client.query("DELETE FROM users WHERE id = $1", [req.user!.userId]);
await client.query("COMMIT");
res.status(200).json({ message: "Account deleted." });
} catch (err) {
await client.query("ROLLBACK");
console.error("Delete account error:", err);
res.status(500).json({ message: "Something went wrong." });
} finally {
client.release();
}
});

// POST /api/users/me/avatar
router.post("/me/avatar", uploadUserAvatar.single("avatar"), async (req: AuthRequest, res: Response): Promise<void> => {
try {
if (!req.file) { res.status(400).json({ message: "No image provided" }); return; }

const avatarUrl = await uploadToCloudinary(req.file.buffer, "barkbuddy/users");

await pool.query(
"UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2",
[avatarUrl, req.user!.userId]
);

const userResult = await pool.query("SELECT name, bio FROM users WHERE id = $1", [req.user!.userId]);
const dogResult = await pool.query("SELECT id, personality FROM dogs WHERE user_id = $1 LIMIT 1", [req.user!.userId]);
const u = userResult.rows[0];
const dog = dogResult.rows[0] ?? null;
const newProfileComplete = calcProfileComplete(
{ name: u.name, bio: u.bio, avatar_url: avatarUrl },
!!dog, !!(dog?.personality?.length)
);
await pool.query("UPDATE users SET profile_complete = $1 WHERE id = $2", [newProfileComplete, req.user!.userId]);

res.json({ message: "Avatar updated", avatarUrl, profileComplete: newProfileComplete });
} catch (err) {
console.error("POST /users/me/avatar error:", err);
res.status(500).json({ message: "Failed to upload image" });
}
});

// POST /api/users/me/banner
router.post("/me/banner", uploadUserBanner.single("banner"), async (req: AuthRequest, res: Response): Promise<void> => {
try {
if (!req.file) { res.status(400).json({ message: "No image provided" }); return; }

const bannerUrl = await uploadToCloudinary(req.file.buffer, "barkbuddy/banners");

await pool.query(
"UPDATE users SET banner_url = $1, updated_at = NOW() WHERE id = $2",
[bannerUrl, req.user!.userId]
);

res.json({ message: "Banner updated", bannerUrl });
} catch (err) {
console.error("POST /users/me/banner error:", err);
res.status(500).json({ message: "Failed to upload banner" });
}
});

// PATCH /api/users/me/preferences
router.patch("/me/preferences", async (req: AuthRequest, res: Response): Promise<void> => {
try {
const { emailNotifications, preferences } = req.body;
const updates: string[] = [];
const params: any[] = [];
const addUpdate = (field: string, val: any) => { params.push(val); updates.push(`${field} = $${params.length}`); };

if (typeof emailNotifications === "boolean") addUpdate("email_notifications", emailNotifications);
if (preferences) addUpdate("preferences", JSON.stringify(preferences));

if (updates.length === 0) { res.status(400).json({ message: "No changes provided" }); return; }

params.push(req.user!.userId);
await pool.query(
`UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${params.length}`,
params
);

res.json({ message: "Preferences updated" });
} catch (err) {
console.error("PATCH /users/me/preferences error:", err);
res.status(500).json({ message: "Something went wrong." });
}
});

// PATCH /api/users/me/dog
router.patch("/me/dog", async (req: AuthRequest, res: Response): Promise<void> => {
try {
const { name, breed, gender, dob, lifeStage, personality } = req.body;
const updates: string[] = [];
const params: any[] = [];
const addUpdate = (field: string, val: any) => { params.push(val); updates.push(`${field} = $${params.length}`); };

if (name) addUpdate("name", name);
if (breed) addUpdate("breed", breed);
if (gender) addUpdate("gender", gender);
if (dob) addUpdate("dob", dob);
if (lifeStage) addUpdate("life_stage", lifeStage);
if (personality) addUpdate("personality", personality);

if (updates.length === 0) { res.status(400).json({ message: "No changes provided" }); return; }

params.push(req.user!.userId);
const result = await pool.query(
`UPDATE dogs SET ${updates.join(", ")}, updated_at = NOW()
WHERE user_id = $${params.length} AND is_main = true
RETURNING
id, name, gender, breed, dob,
life_stage AS "lifeStage",
personality,
avatar_url AS "avatarUrl",
is_main AS "isMain"`,
params
);

const dog = result.rows[0];
const userResult = await pool.query("SELECT name, bio, avatar_url FROM users WHERE id = $1", [req.user!.userId]);
const u = userResult.rows[0];
const newProfileComplete = calcProfileComplete(
{ name: u.name, bio: u.bio, avatar_url: u.avatar_url },
true, !!(dog.personality?.length)
);
await pool.query("UPDATE users SET profile_complete = $1 WHERE id = $2", [newProfileComplete, req.user!.userId]);

res.json({ message: "Dog profile updated", dog, profileComplete: newProfileComplete });
} catch (err) {
console.error("PATCH /users/me/dog error:", err);
res.status(500).json({ message: "Something went wrong." });
}
});

// POST /api/users/me/dog/avatar
router.post("/me/dog/avatar", uploadDogAvatar.single("avatar"), async (req: AuthRequest, res: Response): Promise<void> => {
try {
if (!req.file) { res.status(400).json({ message: "No image provided" }); return; }

const avatarUrl = await uploadToCloudinary(req.file.buffer, "barkbuddy/dogs");

await pool.query(
"UPDATE dogs SET avatar_url = $1, updated_at = NOW() WHERE user_id = $2 AND is_main = true",
[avatarUrl, req.user!.userId]
);

res.json({ message: "Dog avatar updated", avatarUrl });
} catch (err) {
console.error("POST /users/me/dog/avatar error:", err);
res.status(500).json({ message: "Failed to upload image" });
}
});

// POST /api/users/me/dogs
router.post("/me/dogs", [
body("name").notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage("Dog name must be 2–100 characters"),
body("gender").isIn(["male", "female"]).withMessage("Gender must be male or female"),
body("breed").trim().isLength({ min: 2, max: 100 }).withMessage("Breed must be 2–100 characters"),
body("dob").optional().isISO8601().withMessage("DOB must be a valid date"),
body("life_stage").isIn(["puppy", "adult", "senior"]).withMessage("Invalid life stage"),
body("personality").optional().isArray().withMessage("Personality must be an array"),
], multer().none(), async (req: AuthRequest, res: Response): Promise<void> => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
res.status(400).json({
message: "Validation failed",
errors: errors.array().reduce((acc: Record<string, string>, err: any) => { acc[err.path] = err.msg; return acc; }, {}),
});
return;
}

const { name, gender, breed, dob, life_stage, personality = [] } = req.body;
const userId = req.user!.userId;

try {
const countResult = await pool.query("SELECT COUNT(*) FROM dogs WHERE user_id = $1", [userId]);
if (parseInt(countResult.rows[0].count) >= 5) {
res.status(400).json({ message: "Maximum 5 dogs allowed per user" });
return;
}

const result = await pool.query(
`INSERT INTO dogs (user_id, name, gender, breed, dob, life_stage, personality, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
RETURNING id, name, gender, breed, dob, life_stage, personality, avatar_url`,
[userId, name, gender, breed, dob || null, life_stage, JSON.stringify(personality)]
);

res.json({ message: "Dog added successfully", dog: result.rows[0] });
} catch (err) {
console.error("POST /users/me/dogs error:", err);
res.status(500).json({ message: "Something went wrong." });
}
});

// GET /api/users/me/dogs
router.get("/me/dogs", async (req: AuthRequest, res: Response): Promise<void> => {
const userId = req.user!.userId;
try {
const result = await pool.query(
`SELECT id, name, gender, breed, dob, life_stage, personality, avatar_url
FROM dogs WHERE user_id = $1 ORDER BY created_at ASC`,
[userId]
);
res.json({ dogs: result.rows });
} catch (err) {
console.error("GET /users/me/dogs error:", err);
res.status(500).json({ message: "Something went wrong." });
}
});

// PATCH /api/users/me/dogs/:dogId
router.patch("/me/dogs/:dogId", async (req: AuthRequest, res: Response): Promise<void> => {
const dogId = req.params.dogId;
const userId = req.user!.userId;
const { name, breed, gender, dob, life_stage, personality } = req.body;

const updates: string[] = [];
const params: any[] = [];
const addUpdate = (field: string, val: any) => { params.push(val); updates.push(`${field} = $${params.length}`); };

if (name) addUpdate("name", name);
if (breed) addUpdate("breed", breed);
if (gender) addUpdate("gender", gender);
if (dob !== undefined) addUpdate("dob", dob || null);
if (life_stage) addUpdate("life_stage", life_stage);
if (personality !== undefined) addUpdate("personality", JSON.stringify(personality));

if (updates.length === 0) { res.status(400).json({ message: "No changes provided" }); return; }

try {
params.push(userId, dogId);
const result = await pool.query(
`UPDATE dogs SET ${updates.join(", ")}, updated_at = NOW()
WHERE user_id = $${params.length - 1} AND id = $${params.length}
RETURNING id, name, gender, breed, dob, life_stage, personality, avatar_url`,
params
);

if (result.rows.length === 0) { res.status(404).json({ message: "Dog not found" }); return; }
res.json({ message: "Dog updated", dog: result.rows[0] });
} catch (err) {
console.error("PATCH /users/me/dogs/:dogId error:", err);
res.status(500).json({ message: "Something went wrong." });
}
});

// DELETE /api/users/me/dogs/:dogId
router.delete("/me/dogs/:dogId", async (req: AuthRequest, res: Response): Promise<void> => {
const dogId = req.params.dogId;
const userId = req.user!.userId;

try {
const result = await pool.query(
"DELETE FROM dogs WHERE id = $1 AND user_id = $2 RETURNING id",
[dogId, userId]
);
if (result.rows.length === 0) { res.status(404).json({ message: "Dog not found" }); return; }
res.json({ message: "Dog removed" });
} catch (err) {
console.error("DELETE /users/me/dogs/:dogId error:", err);
res.status(500).json({ message: "Something went wrong." });
}
});

// POST /api/users/me/dogs/:dogId/avatar
router.post("/me/dogs/:dogId/avatar", uploadDogAvatar.single("avatar"), async (req: AuthRequest, res: Response): Promise<void> => {
if (!req.file) { res.status(400).json({ message: "No image provided" }); return; }

const dogId = req.params.dogId;
const userId = req.user!.userId;

try {
const avatarUrl = await uploadToCloudinary(req.file.buffer, "barkbuddy/dogs");

await pool.query(
"UPDATE dogs SET avatar_url = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3",
[avatarUrl, dogId, userId]
);
res.json({ message: "Dog avatar updated", avatarUrl });
} catch (err) {
console.error("POST /users/me/dogs/:dogId/avatar error:", err);
res.status(500).json({ message: "Failed to upload image" });
}
});

// GET /api/users/search
router.get("/search", async (req: AuthRequest, res: Response): Promise<void> => {
try {
const query = (req.query.q as string || "").trim();
if (!query || query.length < 2) { res.json({ users: [] }); return; }

const searchTerm = `%${query.toLowerCase()}%`;

const result = await pool.query(
`SELECT
u.id,
u.name,
u.avatar_url AS "avatarUrl",
u.bio,
u.created_at AS "memberSince",
d.name AS "dogName",
d.breed AS "dogBreed",
d.avatar_url AS "dogAvatarUrl",
d.life_stage AS "dogLifeStage"
FROM users u
LEFT JOIN dogs d ON d.user_id = u.id AND d.is_main = true
WHERE u.id != $1
AND (LOWER(u.name) LIKE $2 OR LOWER(d.name) LIKE $2)
ORDER BY u.name ASC
LIMIT 20`,
[req.user!.userId, searchTerm]
);

if (result.rows.length === 0) { res.json({ users: [] }); return; }

const foundUserIds = result.rows.map((r) => r.id);
const buddyStatusResult = await pool.query(
`SELECT br.id, br.status, br.sender_id, br.receiver_id
FROM buddy_requests br
WHERE (br.sender_id = $1 OR br.receiver_id = $1)
AND (br.sender_id = ANY($2::uuid[]) OR br.receiver_id = ANY($2::uuid[]))`,
[req.user!.userId, foundUserIds]
);

const statusMap = new Map<string, { requestId: string; status: string; isSender: boolean }>();
for (const row of buddyStatusResult.rows) {
const targetId = row.sender_id === req.user!.userId ? row.receiver_id : row.sender_id;
statusMap.set(targetId, { requestId: row.id, status: row.status, isSender: row.sender_id === req.user!.userId });
}

const users = result.rows.map((row) => {
const buddyInfo = statusMap.get(row.id);
let status: "none" | "pending_out" | "pending_in" | "buddy" = "none";
if (buddyInfo) {
if (buddyInfo.status === "accepted") status = "buddy";
else if (buddyInfo.isSender) status = "pending_out";
else status = "pending_in";
}
return {
id: row.id,
name: row.name,
avatarUrl: row.avatarUrl,
bio: row.bio ?? "",
memberSince: row.memberSince
? new Date(row.memberSince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
: null,
dogName: row.dogName,
dogBreed: row.dogBreed,
dogAvatarUrl: row.dogAvatarUrl,
dogLifeStage: row.dogLifeStage,
status,
};
});

res.json({ users });
} catch (err) {
console.error("GET /users/search error:", err);
res.status(500).json({ message: "Something went wrong." });
}
});

export default router;