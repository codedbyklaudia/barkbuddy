import { Router, Response } from "express";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { sendToUser } from "../lib/notifications";

const router = Router();
router.use(authenticate);

// Injected by index.ts after io is created
let _io: any = null;
export function setIo(io: any) { _io = io; }

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  try {
    const buddiesResult = await pool.query(
      `SELECT
         br.id,
         u.id          AS "userId",
         u.name,
         u.avatar_url  AS "avatarUrl",
         u.bio,
         d.name        AS "dogName",
         d.breed       AS "dogBreed",
         d.avatar_url  AS "dogAvatar",
         u.created_at  AS "joinedAt",
         br.created_at AS "buddySince"
       FROM buddy_requests br
       JOIN users u ON (
         CASE WHEN br.sender_id = $1 THEN br.receiver_id ELSE br.sender_id END = u.id
       )
       LEFT JOIN dogs d ON d.user_id = u.id
       WHERE (br.sender_id = $1 OR br.receiver_id = $1)
         AND br.status = 'accepted'
       ORDER BY br.created_at DESC`,
      [userId]
    );

    const pendingInResult = await pool.query(
      `SELECT
         br.id,
         u.id         AS "userId",
         u.name,
         u.avatar_url AS "avatarUrl",
         u.bio,
         d.name       AS "dogName",
         d.avatar_url AS "dogAvatar",
         u.created_at AS "joinedAt"
       FROM buddy_requests br
       JOIN users u ON br.sender_id = u.id
       LEFT JOIN dogs d ON d.user_id = u.id
       WHERE br.receiver_id = $1 AND br.status = 'pending'`,
      [userId]
    );

    const pendingOutResult = await pool.query(
      `SELECT
         br.id,
         u.id         AS "userId",
         u.name,
         u.avatar_url AS "avatarUrl",
         d.name       AS "dogName",
         u.created_at AS "joinedAt"
       FROM buddy_requests br
       JOIN users u ON br.receiver_id = u.id
       LEFT JOIN dogs d ON d.user_id = u.id
       WHERE br.sender_id = $1 AND br.status = 'pending'`,
      [userId]
    );

    res.json({
      buddies:    buddiesResult.rows,
      pendingIn:  pendingInResult.rows,
      pendingOut: pendingOutResult.rows,
    });
  } catch (err) {
    console.error("GET /buddies error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// POST /api/buddies/request — send a buddy request
router.post("/request", async (req: AuthRequest, res: Response): Promise<void> => {
  const senderId = req.user!.userId;
  const { userId: receiverId } = req.body;

  if (!receiverId || receiverId === senderId) {
    res.status(400).json({ message: "Invalid target user" });
    return;
  }

  try {
    const existing = await pool.query(
      `SELECT id, status FROM buddy_requests
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)`,
      [senderId, receiverId]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({ message: "Request already exists", status: existing.rows[0].status });
      return;
    }

    await pool.query(
      `INSERT INTO buddy_requests (sender_id, receiver_id, status, created_at)
       VALUES ($1, $2, 'pending', NOW())`,
      [senderId, receiverId]
    );

    // Notify the receiver instantly via socket
    if (_io) {
      _io.to(`user:${receiverId}`).emit("buddy_request_received", {
        fromUserId: senderId,
      });
    }

    res.json({ message: "Buddy request sent" });
  } catch (err) {
    console.error("POST /buddies/request error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// POST /api/buddies/:id/accept
router.post("/:id/accept", async (req: AuthRequest, res: Response): Promise<void> => {
  const accepterId = req.user!.userId;
  const requestId  = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE buddy_requests
       SET status = 'accepted', updated_at = NOW()
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
       RETURNING id, sender_id`,
      [requestId, accepterId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Request not found or already handled" });
      return;
    }

    const originalSenderId = result.rows[0].sender_id;

    // Get the accepter's name to personalise the notification
    const accepterResult = await pool.query(
      `SELECT name FROM users WHERE id = $1`, [accepterId]
    );
    const accepterName = accepterResult.rows[0]?.name ?? "Someone";

    // Push FCM notification to the original sender
    await sendToUser(
      originalSenderId,
      "Buddy Pack 🐾",
      `${accepterName} accepted your invitation to their Buddy Pack!`,
      "buddies",
      "buddy_accepted",
      { acceptedByUserId: accepterId }
    );

    // Push real-time socket event to the original sender so the dashboard
    // updates immediately without waiting for the next app open
    if (_io) {
      _io.to(`user:${originalSenderId}`).emit("buddy_request_accepted", {
        acceptedByUserId: accepterId,
        acceptedByName:   accepterName,
      });
    }

    res.json({ message: "Buddy accepted" });
  } catch (err) {
    console.error("POST /buddies/:id/accept error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// DELETE /api/buddies/:id — remove buddy or decline/cancel request
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  const userId    = req.user!.userId;
  const requestId = req.params.id;

  try {
    const result = await pool.query(
      `DELETE FROM buddy_requests
       WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)
       RETURNING id`,
      [requestId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Buddy relationship not found" });
      return;
    }

    res.json({ message: "Buddy removed" });
  } catch (err) {
    console.error("DELETE /buddies/:id error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;