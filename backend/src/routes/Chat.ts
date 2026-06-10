import { Router, Response } from "express";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// ─── SQL to create tables (run once) ─────────────────────────────────────────
// CREATE TABLE IF NOT EXISTS conversations (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
//   user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
//   last_message TEXT,
//   last_message_at TIMESTAMPTZ,
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   UNIQUE(user1_id, user2_id)
// );
//
// CREATE TABLE IF NOT EXISTS messages (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
//   sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
//   content TEXT NOT NULL,
//   read_at TIMESTAMPTZ,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/chat/conversations — all conversations for current user
router.get("/conversations", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    try {
        const result = await pool.query(
            `SELECT
               c.id,
               c.last_message,
               c.last_message_at,
               -- Other user info
               u.id          AS "otherUserId",
               u.name        AS "otherUserName",
               u.avatar_url  AS "otherUserAvatar",
               -- Unread count
               (SELECT COUNT(*) FROM messages m
                WHERE m.conversation_id = c.id
                  AND m.sender_id != $1
                  AND m.read_at IS NULL) AS "unreadCount"
             FROM conversations c
             JOIN users u ON (
               CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END = u.id
             )
             WHERE c.user1_id = $1 OR c.user2_id = $1
             ORDER BY c.last_message_at DESC NULLS LAST`,
            [userId]
        );
        res.json({ conversations: result.rows });
    } catch (err) {
        console.error("GET /chat/conversations error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// POST /api/chat/conversations — start or get conversation with a buddy
router.post("/conversations", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId  = req.user!.userId;
    const { otherUserId } = req.body;

    if (!otherUserId) { res.status(400).json({ message: "otherUserId required" }); return; }

    try {
        // Check they are buddies
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

        // Upsert conversation (always store lower UUID first for uniqueness)
        const u1 = userId < otherUserId ? userId : otherUserId;
        const u2 = userId < otherUserId ? otherUserId : userId;

        const result = await pool.query(
            `INSERT INTO conversations (user1_id, user2_id)
             VALUES ($1, $2)
             ON CONFLICT (user1_id, user2_id) DO UPDATE SET user1_id = $1
             RETURNING id`,
            [u1, u2]
        );

        res.json({ conversationId: result.rows[0].id });
    } catch (err) {
        console.error("POST /chat/conversations error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// GET /api/chat/conversations/:id/messages — message history
router.get("/conversations/:id/messages", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;
    const limit  = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string; // ISO timestamp for pagination

    try {
        // Verify user is part of this conversation
        const check = await pool.query(
            `SELECT id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
            [convId, userId]
        );
        if (check.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

        const params: any[] = [convId, limit];
        const beforeClause  = before ? `AND m.created_at < $3` : "";
        if (before) params.push(before);

        const result = await pool.query(
            `SELECT
               m.id,
               m.sender_id  AS "senderId",
               m.content,
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

        // Mark messages as read
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

// POST /api/chat/conversations/:id/messages — send a message (REST fallback)
router.post("/conversations/:id/messages", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId  = req.user!.userId;
    const convId  = req.params.id;
    const { content } = req.body;

    if (!content?.trim()) { res.status(400).json({ message: "Message cannot be empty" }); return; }

    try {
        const check = await pool.query(
            `SELECT id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
            [convId, userId]
        );
        if (check.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

        const msg = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content)
             VALUES ($1, $2, $3) RETURNING id, sender_id, content, created_at`,
            [convId, userId, content.trim()]
        );

        // Update conversation last_message
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

// GET /api/chat/status/:userId — check if a user is online (last_seen within 2 mins)
router.get("/status/:userId", async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            `SELECT last_seen, status FROM users WHERE id = $1`, [userId]);
        if (result.rows.length === 0) { res.status(404).json({ online: false }); return; }

        const lastSeen = result.rows[0].last_seen;
        const status   = result.rows[0].status;

        // Consider online if last_seen within last 2 minutes
        const isOnline = lastSeen
            && (new Date().getTime() - new Date(lastSeen).getTime()) < 2 * 60 * 1000;

        res.json({
            online:   !!isOnline,
            lastSeen: lastSeen,
            status:   status,
        });
    } catch (err) {
        console.error("GET /chat/status error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

export default router;