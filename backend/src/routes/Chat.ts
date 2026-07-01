import { Router, Response } from "express";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /api/chat/conversations
// Returns all conversations for the current user.
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
               c.is_group                          AS "isGroup",
               c.group_name                        AS "groupName",
               c.group_avatar                      AS "groupAvatar",
               -- 1:1 other user (null for groups)
               CASE WHEN c.is_group THEN NULL ELSE u.id          END AS "otherUserId",
               CASE WHEN c.is_group THEN c.group_name ELSE u.name        END AS "otherUserName",
               CASE WHEN c.is_group THEN c.group_avatar ELSE u.avatar_url END AS "otherUserAvatar",
               -- Unread count (messages not sent by me that I haven't read)
               (SELECT COUNT(*)
                FROM messages m
                WHERE m.conversation_id = c.id
                  AND m.sender_id != $1
                  AND m.read_at IS NULL)            AS "unreadCount",
               -- Archived flag per user
               EXISTS(
                 SELECT 1 FROM conversation_archives ca
                 WHERE ca.conversation_id = c.id AND ca.user_id = $1
               )                                    AS "isArchived"
             FROM conversations c
             -- Join the members table to check membership for all chat types
             JOIN conversation_members cm
               ON cm.conversation_id = c.id AND cm.user_id = $1
             -- Left-join users only for 1:1 chats to get the other person's info
             LEFT JOIN conversation_members cm2
               ON cm2.conversation_id = c.id AND cm2.user_id != $1 AND NOT c.is_group
             LEFT JOIN users u
               ON u.id = cm2.user_id AND NOT c.is_group
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

// ── POST /api/chat/conversations ──────────────────────────────────────────────
// Start or retrieve a 1:1 conversation with a buddy.
router.post("/conversations", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId      = req.user!.userId;
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

        // Ensure both users are in conversation_members
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

// ── POST /api/chat/conversations/group ───────────────────────────────────────
// Create a group chat with a name and initial member list.
// Body: { groupName, memberIds: string[] }
router.post("/conversations/group", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { groupName, memberIds } = req.body as {
        groupName: string;
        memberIds: string[];
    };

    if (!groupName?.trim()) {
        res.status(400).json({ message: "groupName is required" });
        return;
    }
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
        res.status(400).json({ message: "memberIds must be a non-empty array" });
        return;
    }

    // Deduplicate and always include the creator
    const allMembers = [...new Set([userId, ...memberIds])];

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const conv = await client.query(
            `INSERT INTO conversations (is_group, group_name)
             VALUES (true, $1)
             RETURNING id`,
            [groupName.trim()]
        );
        const convId = conv.rows[0].id;

        // Add all members
        const memberValues = allMembers
            .map((_, i) => `($1, $${i + 2})`)
            .join(", ");
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
// List all members of a conversation (useful for group info screen).
router.get("/conversations/:id/members", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;

    try {
        const access = await pool.query(
            `SELECT 1 FROM conversation_members
             WHERE conversation_id = $1 AND user_id = $2`,
            [convId, userId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

        const result = await pool.query(
            `SELECT u.id, u.name, u.avatar_url AS "avatarUrl", cm.joined_at AS "joinedAt"
             FROM conversation_members cm
             JOIN users u ON u.id = cm.user_id
             WHERE cm.conversation_id = $1
             ORDER BY cm.joined_at ASC`,
            [convId]
        );
        res.json({ members: result.rows });
    } catch (err) {
        console.error("GET /chat/members error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── POST /api/chat/conversations/:id/members ──────────────────────────────────
// Add a user to a group chat.
// Body: { userId: string }
router.post("/conversations/:id/members", async (req: AuthRequest, res: Response): Promise<void> => {
    const requesterId = req.user!.userId;
    const convId      = req.params.id;
    const { userId: newMemberId } = req.body;

    if (!newMemberId) { res.status(400).json({ message: "userId required" }); return; }

    try {
        // Check requester is already in the group
        const access = await pool.query(
            `SELECT c.is_group FROM conversations c
             JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
             WHERE c.id = $2`,
            [requesterId, convId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }
        if (!access.rows[0].is_group) {
            res.status(400).json({ message: "Cannot add members to a 1:1 chat" });
            return;
        }

        await pool.query(
            `INSERT INTO conversation_members (conversation_id, user_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [convId, newMemberId]
        );

        res.json({ ok: true });
    } catch (err) {
        console.error("POST /chat/members error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── PATCH /api/chat/conversations/:id/archive ─────────────────────────────────
router.patch("/conversations/:id/archive", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;

    try {
        const access = await pool.query(
            `SELECT 1 FROM conversation_members
             WHERE conversation_id = $1 AND user_id = $2`,
            [convId, userId]
        );
        if (access.rows.length === 0) { res.status(403).json({ message: "Forbidden" }); return; }

        await pool.query(
            `INSERT INTO conversation_archives (conversation_id, user_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
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
            `DELETE FROM conversation_archives
             WHERE conversation_id = $1 AND user_id = $2`,
            [convId, userId]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error("PATCH /chat/unarchive error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// ── GET /api/chat/conversations/:id/messages ──────────────────────────────────
router.get("/conversations/:id/messages", async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const convId = req.params.id;
    const limit  = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string;

    try {
        const access = await pool.query(
            `SELECT 1 FROM conversation_members
             WHERE conversation_id = $1 AND user_id = $2`,
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
    const userId  = req.user!.userId;
    const convId  = req.params.id;
    const { content } = req.body;

    if (!content?.trim()) { res.status(400).json({ message: "Message cannot be empty" }); return; }

    try {
        const access = await pool.query(
            `SELECT 1 FROM conversation_members
             WHERE conversation_id = $1 AND user_id = $2`,
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
            `SELECT last_seen, status FROM users WHERE id = $1`, [userId]);
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

export default router;