import { Router, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.use(authenticate);

// POST /api/chat/dog-assistant
router.post("/dog-assistant", async (req: AuthRequest, res: Response): Promise<void> => {
    const { system, messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "messages array required" });
        return;
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables");
        res.status(500).json({ error: "GEMINI_API_KEY not configured" });
        return;
    }
    console.log("Gemini key present, length:", process.env.GEMINI_API_KEY.length);

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const contents = messages.map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));

        const body = {
            system_instruction: {
                parts: [{ text: system || "You are a helpful dog care assistant." }],
            },
            contents,
            generationConfig: {
                maxOutputTokens: 1500,
                temperature: 0.7,
            },
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error("Gemini error status:", response.status, responseText);
            res.status(500).json({ error: "Chat failed", detail: responseText });
            return;
        }

        const data = JSON.parse(responseText) as any;
        const reply: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        if (!reply) {
            console.error("Gemini empty reply:", JSON.stringify(data));
            res.status(500).json({ error: "Empty response from Gemini" });
            return;
        }

        res.json({ reply });
    } catch (err: any) {
        console.error("Dog assistant error:", err?.message);
        res.status(500).json({ error: "Chat failed" });
    }
});

// ── GET /api/chat/conversations ───────────────────────────────────────────────
router.get("/conversations", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const q      = (req.query.q as string || "").trim();

    try {
        const params: any[] = [userId];
        const searchClause  = q
            ? `AND (c.last_message ILIKE $2 OR c.group_name ILIKE $2 OR u.name ILIKE $2)`
            : "";
        if (q) params.push(`%${q}%`);

        const result = await pool.query(
            `SELECT
               c.id,
               c.last_message,
               c.last_message_at,
               c.is_group                                                    AS "isGroup",
               c.group_name                                                  AS "groupName",
               c.group_avatar                                                AS "groupAvatar",
               CASE WHEN c.is_group THEN NULL        ELSE u.id          END  AS "otherUserId",
               CASE WHEN c.is_group THEN c.group_name ELSE u.name       END  AS "otherUserName",
               CASE WHEN c.is_group THEN c.group_avatar ELSE u.avatar_url END AS "otherUserAvatar",
               (SELECT COUNT(*)
                FROM messages m
                WHERE m.conversation_id = c.id
                  AND m.sender_id != $1
                  AND m.read_at IS NULL)                                     AS "unreadCount",
               EXISTS(
                 SELECT 1 FROM conversation_archives ca
                 WHERE ca.conversation_id = c.id AND ca.user_id = $1
               )                                                             AS "isArchived"
             FROM conversations c
             JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
             LEFT JOIN conversation_members cm2
               ON cm2.conversation_id = c.id AND cm2.user_id != $1 AND NOT c.is_group
             LEFT JOIN users u ON u.id = cm2.user_id AND NOT c.is_group
             ${searchClause}
             ORDER BY c.last_message_at DESC NULLS LAST`,
            params
        );
        res.json({ conversations: result.rows });
    } catch (err) {
        console.error("GET /chat/conversations error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── POST /api/chat/conversations — start or get 1:1 conversation ──────────────
router.post("/conversations", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId          = req.user!.userId;
    const { otherUserId } = req.body;

    if (!otherUserId) { res.status(400).json({ message: "otherUserId required" }); return; }

    try {
        const buddyCheck = await pool.query(
            `SELECT id FROM buddy_requests
             WHERE ((sender_id = $1 AND receiver_id = $2)
                OR  (sender_id = $2 AND receiver_id = $1))
               AND status = 'accepted'`,
            [userId, otherUserId]
        );
        if (buddyCheck.rows.length === 0) {
            res.status(403).json({ message: "You can only chat with buddies" });
            return;
        }

        const u1 = userId < otherUserId ? userId : otherUserId;
        const u2 = userId < otherUserId ? otherUserId : userId;

        const result = await pool.query(
            `INSERT INTO conversations (user1_id, user2_id, is_group)
             VALUES ($1, $2, false)
             ON CONFLICT (user1_id, user2_id) DO UPDATE SET user1_id = $1
             RETURNING id`,
            [u1, u2]
        );
        const convId = result.rows[0].id;

        await pool.query(
            `INSERT INTO conversation_members (conversation_id, user_id)
             VALUES ($1, $2), ($1, $3)
             ON CONFLICT DO NOTHING`,
            [convId, u1, u2]
        );

        res.json({ conversationId: convId });
    } catch (err) {
        console.error("POST /chat/conversations error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── POST /api/chat/conversations/group — create group ────────────────────────
router.post("/conversations/group", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { groupName, memberIds } = req.body as {
        groupName: string;
        memberIds: string[];
    };

    if (!groupName?.trim()) {
        res.status(400).json({ message: "groupName is required" }); return;
    }
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
        res.status(400).json({ message: "memberIds must be a non-empty array" }); return;
    }

    const allMembers = [...new Set([userId, ...memberIds])];
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const conv = await client.query(
            `INSERT INTO conversations (is_group, group_name, created_by)
             VALUES (true, $1, $2)
             RETURNING id`,
            [groupName.trim(), userId]
        );
        const convId = conv.rows[0].id;

        const memberValues = allMembers.map((_, i) => `($1, $${i + 2})`).join(", ");
        await client.query(
            `INSERT INTO conversation_members (conversation_id, user_id)
             VALUES ${memberValues}
             ON CONFLICT DO NOTHING`,
            [convId, ...allMembers]
        );

        await client.query("COMMIT");
        res.status(201).json({ conversationId: convId });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("POST /chat/conversations/group error:", err);
        res.status(500).json({ message: "Something went wrong." });
    } finally {
        client.release();
    }
});

// ── GET /api/chat/conversations/:id/members ───────────────────────────────────
router.get("/conversations/:id/members", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;

    try {
        const access = await pool.query(
            `SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
            [convId, userId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

        const result = await pool.query(
            `SELECT
               u.id,
               u.name,
               u.avatar_url  AS "avatarUrl",
               cm.joined_at  AS "joinedAt",
               (c.created_by = u.id) AS "isCreator"
             FROM conversation_members cm
             JOIN users u ON u.id = cm.user_id
             JOIN conversations c ON c.id = cm.conversation_id
             WHERE cm.conversation_id = $1
             ORDER BY "isCreator" DESC, cm.joined_at ASC`,
            [convId]
        );
        res.json({ members: result.rows });
    } catch (err) {
        console.error("GET /chat/members error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── POST /api/chat/conversations/:id/members — add member ────────────────────
router.post("/conversations/:id/members", async (req: AuthRequest, res: Response): Promise<void> => {
    const requesterId       = req.user!.userId;
    const convId            = req.params.id;
    const { userId: newId } = req.body;

    if (!newId) { res.status(400).json({ message: "userId required" }); return; }

    try {
        const access = await pool.query(
            `SELECT c.is_group, c.created_by FROM conversations c
             JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
             WHERE c.id = $2`,
            [requesterId, convId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }
        if (!access.rows[0].is_group) {
            res.status(400).json({ message: "Cannot add members to a 1:1 chat" }); return;
        }
        if (access.rows[0].created_by !== requesterId) {
            res.status(403).json({ message: "Only the group admin can add members" }); return;
        }

        await pool.query(
            `INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [convId, newId]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error("POST /chat/members error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── DELETE /api/chat/conversations/:id/members/me — leave group ───────────────
router.delete("/conversations/:id/members/me", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;

    try {
        await pool.query(
            `DELETE FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
            [convId, userId]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error("DELETE /chat/members/me error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── DELETE /api/chat/conversations/:id/members/:userId — remove member ────────
router.delete("/conversations/:id/members/:userId", async (req: AuthRequest, res: Response): Promise<void> => {
    const requesterId  = req.user!.userId;
    const convId       = req.params.id;
    const targetUserId = req.params.userId;

    try {
        const access = await pool.query(
            `SELECT c.is_group, c.created_by FROM conversations c
             JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
             WHERE c.id = $2`,
            [requesterId, convId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }
        if (!access.rows[0].is_group) { res.status(400).json({ message: "Not a group" }); return; }
        if (access.rows[0].created_by !== requesterId) {
            res.status(403).json({ message: "Only the group admin can remove members" }); return;
        }

        await pool.query(
            `DELETE FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
            [convId, targetUserId]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error("DELETE /chat/members/:userId error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── PUT /api/chat/conversations/:id/group — update group name / avatar ────────
router.put("/conversations/:id/group", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;
    const { groupName, groupAvatar } = req.body as { groupName?: string; groupAvatar?: string };

    try {
        const access = await pool.query(
            `SELECT is_group FROM conversations c
             JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
             WHERE c.id = $2`,
            [userId, convId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }
        if (!access.rows[0].is_group)  { res.status(400).json({ message: "Not a group" }); return; }

        const sets: string[] = [];
        const params: any[]  = [];
        let   idx            = 1;

        if (groupName)   { sets.push(`group_name = $${idx++}`);   params.push(groupName.trim()); }
        if (groupAvatar) { sets.push(`group_avatar = $${idx++}`); params.push(groupAvatar); }
        if (sets.length === 0) { res.status(400).json({ message: "Nothing to update" }); return; }

        params.push(convId);
        await pool.query(`UPDATE conversations SET ${sets.join(", ")} WHERE id = $${idx}`, params);
        res.json({ ok: true });
    } catch (err) {
        console.error("PUT /chat/conversations/group error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── POST /api/chat/conversations/:id/avatar — upload group avatar ─────────────
router.post(
    "/conversations/:id/avatar",
    upload.single("avatar"),
    async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user!.userId;
        const convId = req.params.id;

        if (!req.file) { res.status(400).json({ message: "No file uploaded" }); return; }

        try {
            const access = await pool.query(
                `SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
                [convId, userId]
            );
            if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

            const avatarUrl: string = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "barkbuddy/group_avatars", transformation: [{ width: 200, crop: "fill" }] },
                    (err, result) => {
                        if (err || !result) return reject(err);
                        resolve(result.secure_url);
                    }
                );
                streamifier.createReadStream(req.file!.buffer).pipe(stream);
            });

            await pool.query(
                `UPDATE conversations SET group_avatar = $1 WHERE id = $2`, [avatarUrl, convId]
            );
            res.json({ avatarUrl });
        } catch (err) {
            console.error("POST /chat/conversations/avatar error:", err);
            res.status(500).json({ message: "Something went wrong." });
        }
    }
);

// ── PATCH /api/chat/conversations/:id/archive ─────────────────────────────────
router.patch("/conversations/:id/archive", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;

    try {
        const access = await pool.query(
            `SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
            [convId, userId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

        await pool.query(
            `INSERT INTO conversation_archives (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [convId, userId]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error("PATCH /chat/archive error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── PATCH /api/chat/conversations/:id/unarchive ───────────────────────────────
router.patch("/conversations/:id/unarchive", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;

    try {
        await pool.query(
            `DELETE FROM conversation_archives WHERE conversation_id = $1 AND user_id = $2`,
            [convId, userId]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error("PATCH /chat/unarchive error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── DELETE /api/chat/conversations/:id — delete conversation ──────────────────
router.delete("/conversations/:id", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;

    try {
        const conv = await pool.query(
            `SELECT created_by, is_group FROM conversations
             JOIN conversation_members cm ON cm.conversation_id = conversations.id AND cm.user_id = $1
             WHERE conversations.id = $2`,
            [userId, convId]
        );
        if (conv.rows.length === 0) { res.status(404).json({ message: "Not found" }); return; }

        const { created_by, is_group } = conv.rows[0];

        if (is_group && created_by !== userId) {
            res.status(403).json({ message: "Only the group creator can delete it" }); return;
        }

        await pool.query(`DELETE FROM conversations WHERE id = $1`, [convId]);
        res.json({ ok: true });
    } catch (err) {
        console.error("DELETE /chat/conversations error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── POST /api/chat/send-image ─────────────────────────────────────────────────
router.post(
    "/send-image",
    upload.single("image"),
    async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user!.userId;
        const convId = req.body.conversationId as string;

        if (!convId)    { res.status(400).json({ message: "conversationId required" }); return; }
        if (!req.file)  { res.status(400).json({ message: "No image uploaded" });       return; }

        try {
            const access = await pool.query(
                `SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
                [convId, userId]
            );
            if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

            const imageUrl: string = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "barkbuddy/chat_images",
                        transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
                    },
                    (err, result) => {
                        if (err || !result) return reject(err);
                        resolve(result.secure_url);
                    }
                );
                streamifier.createReadStream(req.file!.buffer).pipe(stream);
            });

            const msg = await pool.query(
                `INSERT INTO messages (conversation_id, sender_id, content, image_url)
                 VALUES ($1, $2, '', $3)
                 RETURNING id, sender_id AS "senderId", content, image_url AS "imageUrl", created_at AS "createdAt"`,
                [convId, userId, imageUrl]
            );

            await pool.query(
                `UPDATE conversations SET last_message = '📷 Image', last_message_at = NOW() WHERE id = $1`,
                [convId]
            );

            res.status(201).json({ message: msg.rows[0] });
        } catch (err) {
            console.error("POST /chat/send-image error:", err);
            res.status(500).json({ message: "Something went wrong." });
        }
    }
);

// ── GET /api/chat/conversations/:id/messages ──────────────────────────────────
router.get("/conversations/:id/messages", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;
    const limit  = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string;

    try {
        const access = await pool.query(
            `SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
            [convId, userId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

        const params: any[] = [convId, limit];
        const beforeClause  = before ? `AND m.created_at < $3` : "";
        if (before) params.push(before);

        const result = await pool.query(
            `SELECT
               m.id,
               m.sender_id  AS "senderId",
               m.content,
               m.image_url  AS "imageUrl",
               m.read_at    AS "readAt",
               m.created_at AS "createdAt",
               u.name       AS "senderName",
               u.avatar_url AS "senderAvatar"
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.conversation_id = $1 ${beforeClause}
             ORDER BY m.created_at DESC
             LIMIT $2`,
            params
        );

        await pool.query(
            `UPDATE messages SET read_at = NOW()
             WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`,
            [convId, userId]
        );

        res.json({ messages: result.rows.reverse() });
    } catch (err) {
        console.error("GET /chat/messages error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── POST /api/chat/conversations/:id/messages ─────────────────────────────────
router.post("/conversations/:id/messages", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId      = req.user!.userId;
    const convId      = req.params.id;
    const { content } = req.body;

    if (!content?.trim()) { res.status(400).json({ message: "Message cannot be empty" }); return; }

    try {
        const access = await pool.query(
            `SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
            [convId, userId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

        const msg = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content)
             VALUES ($1, $2, $3) RETURNING id, sender_id, content, created_at`,
            [convId, userId, content.trim()]
        );

        await pool.query(
            `UPDATE conversations SET last_message = $1, last_message_at = NOW() WHERE id = $2`,
            [content.trim().substring(0, 100), convId]
        );

        res.status(201).json({ message: msg.rows[0] });
    } catch (err) {
        console.error("POST /chat/messages error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── GET /api/chat/status/:userId ──────────────────────────────────────────────
router.get("/status/:userId", async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            `SELECT last_seen, status FROM users WHERE id = $1`, [userId]
        );
        if (result.rows.length === 0) { res.status(404).json({ online: false }); return; }

        const { last_seen, status } = result.rows[0];
        const isOnline = last_seen
            && (new Date().getTime() - new Date(last_seen).getTime()) < 2 * 60 * 1000;

        res.json({ online: !!isOnline, lastSeen: last_seen, status });
    } catch (err) {
        console.error("GET /chat/status error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});
router.post("/dog-tips", async (req: AuthRequest, res: Response): Promise<void> => {
    const { breed, lifeStage, category } = req.body;
 
    if (!breed || !lifeStage || !category) {
        res.status(400).json({ error: "breed, lifeStage, and category are required" });
        return;
    }
 
    if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({ error: "GEMINI_API_KEY not configured" });
        return;
    }
 
    const stageDesc = (s: string) => {
        switch (s.toLowerCase()) {
            case "puppy":  return "0–6 months old, learning everything for the first time";
            case "teen":   return "6–18 months old, adolescent, brain rewiring, testing limits";
            case "adult":  return "18 months–7 years old, fully grown, established habits";
            case "senior": return "7+ years old, slowing down, needs gentler approach";
            default:       return s;
        }
    };
 
    const catDesc = (c: string) => {
        switch (c) {
            case "Training":  return "behaviour, commands, socialisation, mental enrichment";
            case "Grooming":  return "coat care, brushing, bathing, nails, ears, teeth";
            case "Health":    return "preventive care, vaccinations, breed conditions, vet visits";
            case "Nutrition": return "diet, feeding, portions, supplements, toxic foods";
            default:          return c;
        }
    };
 
    const systemPrompt = `You are a professional veterinary-informed dog care writer.
You write specific, practical, breed-aware care tips.
Every tip must be directly relevant to a ${lifeStage} ${breed}.
Never write generic advice that applies to any dog — always reference the ${breed}'s specific traits, predispositions, or life stage needs.
Return ONLY a valid JSON array with exactly 5 objects. No markdown, no explanation, no backticks, no text before or after the array.
Each object must have exactly these fields:
- title: short tip title (string)
- summary: one sentence describing the tip (string)  
- points: array of exactly 4 practical bullet points (array of strings)
- calloutTitle: short callout heading (string)
- calloutBody: one important highlighted fact or warning (string)`;
 
    const userPrompt = `Generate exactly 5 ${category} tips for a ${lifeStage} ${breed}.
Life stage: ${stageDesc(lifeStage)}.
Category focus: ${catDesc(category)}.
Return a JSON array of exactly 5 objects. Start your response with [ and end with ].`;
 
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
 
        const body = {
            system_instruction: {
                parts: [{ text: systemPrompt }],
            },
            contents: [
                { role: "user", parts: [{ text: userPrompt }] }
            ],
            generationConfig: {
                maxOutputTokens: 4000,  // enough for 5 detailed tips
                temperature: 0.7,
                responseMimeType: "application/json",  // force Gemini to return JSON
            },
        };
 
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
 
        const responseText = await response.text();
 
        if (!response.ok) {
            console.error("Gemini tips error:", response.status, responseText);
            res.status(500).json({ error: "Tips generation failed", detail: responseText });
            return;
        }
 
        const data = JSON.parse(responseText) as any;
        const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
 
        if (!raw) {
            console.error("Gemini empty tips reply:", JSON.stringify(data));
            res.status(500).json({ error: "Empty response from Gemini" });
            return;
        }
 
        // Clean and validate JSON before sending
        let json = raw.trim()
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
 
        const start = json.indexOf("[");
        const end   = json.lastIndexOf("]");
        if (start === -1 || end === -1 || end <= start) {
            console.error("Gemini tips: no valid JSON array found in:", raw);
            res.status(500).json({ error: "Invalid JSON from Gemini" });
            return;
        }
        json = json.substring(start, end + 1);
 
        // Validate it parses before sending
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            res.status(500).json({ error: "Empty tips array from Gemini" });
            return;
        }
 
        console.log(`Generated ${parsed.length} tips for ${breed} ${lifeStage} ${category}`);
        res.json({ tips: parsed });
 
    } catch (err: any) {
        console.error("Dog tips error:", err?.message);
        res.status(500).json({ error: "Tips generation failed" });
    }
});
export default router;