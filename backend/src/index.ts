import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { createServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";

import authRoutes              from "./routes/auth";
import usersRoutes             from "./routes/users";
import passwordRoutes          from "./routes/password";
import healthEventsRoutes      from "./routes/healthEvents";
import forumRoutes             from "./routes/Forum";
import notificationsRouter     from "./routes/Notifications";
import businessRoutes          from "./routes/Business";
import contactRouter           from "./routes/Contact";
import adminRouter             from "./routes/Admin";
import businessAuthRouter      from "./routes/Businessauth";
import businessPasswordRouter  from "./routes/Businesspassword";
import businessDashboardRouter from "./routes/Businessdashboard";
import listingsRouter          from "./routes/Listings";
import buddiesRouter           from "./routes/buddies";
import dogsRouter              from "./routes/Dogs";
import reviewRouter            from "./routes/Reviews";
import profileRouter           from "./routes/ProfileRoutes";
import savedRouter             from "./routes/saved";
import walksRouter             from "./routes/Walks";
import chatRouter              from "./routes/Chat";
import accountRoutes           from "./routes/Account";
import reportsRouter           from "./routes/Reports";
import { verifyToken }         from "./utils/jwt";
import pool                    from "./db";
import { startDeletionCron }   from "./jobs/deleteExpiredAccounts";
import { sendToUser }          from "./lib/notifications";

dotenv.config();
startDeletionCron(pool);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("☁️  Cloudinary configured for:", process.env.CLOUDINARY_CLOUD_NAME ?? "⚠️  MISSING");

const app  = express();
const PORT = process.env.PORT || 4000;

pool.on("connect", () => console.log("✅ PostgreSQL connected"));
pool.on("error",   (err) => console.error("❌ PostgreSQL error:", err));

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://barkbuddy.org.uk",
    "https://www.barkbuddy.org.uk",
    "http://www.barkbuddy.org.uk",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.warn("[CORS] Blocked origin:", origin);
        callback(null, false);
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads"), { maxAge: "1y", immutable: true }));
app.use("/assets",  express.static(path.join(__dirname, "../assets"),  { maxAge: "1y", immutable: true }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

app.use("/api/auth",               authRoutes);
app.use("/api/saved",              savedRouter);
app.use("/api/users",              usersRoutes);
app.use("/api/users",              profileRouter);
app.use("/api/password",           passwordRoutes);
app.use("/api/health-events",      healthEventsRoutes);
app.use("/api/forum",              forumRoutes);
app.use("/api/notifications",      notificationsRouter);
app.use("/api/buddies",            buddiesRouter);
app.use("/api/dogs",               dogsRouter);
app.use("/api/reviews",            reviewRouter);
app.use("/api/contact",            contactRouter);
app.use("/api/admin",              adminRouter);
app.use("/api/business/password",  businessPasswordRouter);
app.use("/api/business/dashboard", businessDashboardRouter);
app.use("/api/business",           businessAuthRouter);
app.use("/api/business",           businessRoutes);
app.use("/api/listings",           listingsRouter);
app.use("/api/walks",              walksRouter);
app.use("/api/reports",            reportsRouter);
app.use("/api/chat",               chatRouter);
app.use("/api/account",            accountRoutes(pool));

app.get("/api/listings/new", async (_req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, description, category, image_url, city,
                   rating, review_count, is_verified,
                   ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
            FROM listings WHERE is_active = true AND is_verified = true
            ORDER BY created_at DESC LIMIT 3
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("GET /api/listings/new error:", err);
        res.status(500).json({ error: "Failed to fetch new listings" });
    }
});

app.get("/api/categories", async (_req, res) => {
    try {
        const result = await pool.query(`
            SELECT category, COUNT(*) AS count FROM listings
            WHERE is_active = true GROUP BY category ORDER BY count DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

app.get("/api/autocomplete", async (req, res) => {
    const q = (req.query.q as string) || "";
    if (q.length < 2) { res.json([]); return; }
    try {
        const [categoryResults, titleResults] = await Promise.all([
            pool.query(`SELECT DISTINCT category AS label, 'category' AS type, COUNT(*) AS count
                FROM listings WHERE category ILIKE $1 AND is_active = true
                GROUP BY category ORDER BY count DESC LIMIT 4`, [`%${q}%`]),
            pool.query(`SELECT DISTINCT title AS label, category AS type, city
                FROM listings WHERE title ILIKE $1 AND is_active = true LIMIT 4`, [`%${q}%`]),
        ]);
        res.json([...categoryResults.rows, ...titleResults.rows]);
    } catch (err) {
        res.status(500).json({ error: "Autocomplete failed" });
    }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError || err?.message?.includes("Only JPG")) {
        res.status(400).json({ message: err.message }); return;
    }
    next(err);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[Global error]", err);
    res.status(err.status ?? 500).json({ message: err.message ?? "Internal server error" });
});

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// ─── HTTP + Socket.io ─────────────────────────────────────────────────────────
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
        const payload = verifyToken(token);
        (socket as any).userId = payload.userId;
        next();
    } catch {
        next(new Error("Invalid token"));
    }
});

io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    socket.join(`user:${userId}`);

    // Notify buddies online
    (async () => {
        try {
            await pool.query(
                `UPDATE users SET last_seen = NOW() WHERE id = $1`, [userId]);
            const buddies = await pool.query(
                `SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS buddy_id
                 FROM buddy_requests WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'accepted'`,
                [userId]
            );
            for (const row of buddies.rows) {
                io.to(`user:${row.buddy_id}`).emit("buddy_came_online", { userId });
            }
        } catch (err) { console.error("[Socket] online notify error:", err); }
    })();

    socket.on("join_conversation",  (id: string) => socket.join(`conv:${id}`));
    socket.on("leave_conversation", (id: string) => socket.leave(`conv:${id}`));

    socket.on("send_message", async (data: { conversationId: string; content: string }) => {
        if (!data.content?.trim()) return;
        try {
            // Works for both 1:1 and group — blocks left users too
            const access = await pool.query(
                `SELECT 1 FROM conversation_members
                 WHERE conversation_id = $1 AND user_id = $2 AND left_at IS NULL`,
                [data.conversationId, userId]
            );
            if (access.rows.length === 0) {
                console.log(`[Socket] send_message blocked — user ${userId} not active member of ${data.conversationId}`);
                return;
            }

            const result = await pool.query(
                `INSERT INTO messages (conversation_id, sender_id, content)
                 VALUES ($1, $2, $3)
                 RETURNING id, sender_id AS "senderId", content, created_at AS "createdAt"`,
                [data.conversationId, userId, data.content.trim()]
            );

            await pool.query(
                `UPDATE conversations SET last_message = $1, last_message_at = NOW()
                 WHERE id = $2`,
                [data.content.trim().substring(0, 100), data.conversationId]
            );

            // Emit to everyone in conversation room
            io.to(`conv:${data.conversationId}`).emit("new_message", {
                conversationId: data.conversationId,
                message: result.rows[0],
            });

            // Get sender name + conversation info for notifications
            const senderResult = await pool.query(
                `SELECT name FROM users WHERE id = $1`, [userId]
            );
            const senderName = senderResult.rows[0]?.name ?? "Someone";

            const convInfo = await pool.query(
                `SELECT is_group, group_name FROM conversations WHERE id = $1`,
                [data.conversationId]
            );
            const isGroup   = convInfo.rows[0]?.is_group;
            const groupName = convInfo.rows[0]?.group_name;

            // Notify all other active members
            const members = await pool.query(
                `SELECT user_id FROM conversation_members
                 WHERE conversation_id = $1 AND user_id != $2 AND left_at IS NULL`,
                [data.conversationId, userId]
            );

            for (const member of members.rows) {
                io.to(`user:${member.user_id}`).emit("conversation_updated", {
                    conversationId: data.conversationId,
                    lastMessage: data.content.trim(),
                });

                await sendToUser(
                    member.user_id,
                    isGroup ? `${senderName} in ${groupName}` : `${senderName} 💬`,
                    data.content.trim().substring(0, 100),
                    "messages",
                    "new_message",
                    { conversationId: data.conversationId }
                );
            }

        } catch (err) {
            console.error("[Socket] send_message error:", err);
        }
    });

    socket.on("typing", (data: { conversationId: string; isTyping: boolean }) => {
        socket.to(`conv:${data.conversationId}`).emit("user_typing", {
            userId, isTyping: data.isTyping,
        });
    });

    socket.on("set_status", async (status: string) => {
        if (!["online", "on_a_walk", "custom"].includes(status)) return;
        try {
            await pool.query(
                `UPDATE users SET status = $1, status_updated_at = NOW() WHERE id = $2`,
                [status, userId]
            );
            const buddies = await pool.query(
                `SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS buddy_id
                 FROM buddy_requests WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'accepted'`,
                [userId]
            );
            for (const row of buddies.rows) {
                io.to(`user:${row.buddy_id}`).emit("buddy_status_changed", { userId, status });
            }
        } catch (err) {
            console.error("[Socket] set_status error:", err);
        }
    });

    socket.on("disconnect", async () => {
        console.log(`[Socket] Disconnected: ${userId}`);
        try {
            await pool.query(
                `UPDATE users SET last_seen = NOW(), status = NULL WHERE id = $1`,
                [userId]
            );
            const buddies = await pool.query(
                `SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS buddy_id
                 FROM buddy_requests WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'accepted'`,
                [userId]
            );
            for (const row of buddies.rows) {
                io.to(`user:${row.buddy_id}`).emit("buddy_went_offline", {
                    userId,
                    lastSeen: new Date().toISOString(),
                });
            }
        } catch (err) {
            console.error("[Socket] disconnect update error:", err);
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 BarkBuddy server running on port ${PORT}`);
    console.log(`   NODE_ENV:   ${process.env.NODE_ENV ?? "development"}`);
    console.log(`   DATABASE:   ${process.env.DATABASE_URL             ? "✅ set" : "❌ MISSING"}`);
    console.log(`   JWT:        ${process.env.JWT_SECRET               ? "✅ set" : "❌ MISSING"}`);
    console.log(`   RESEND:     ${process.env.RESEND_API_KEY           ? "✅ set" : "❌ MISSING"}`);
    console.log(`   CLOUDINARY: ${process.env.CLOUDINARY_CLOUD_NAME   ? "✅ set" : "❌ MISSING"}`);
    console.log(`   FIREBASE:   ${process.env.FIREBASE_SERVICE_ACCOUNT ? "✅ set" : "❌ MISSING"}`);
});

export default app;