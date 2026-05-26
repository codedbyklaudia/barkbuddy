import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

import authRoutes             from "./routes/auth";
import usersRoutes            from "./routes/users";
import passwordRoutes         from "./routes/password";
import healthEventsRoutes     from "./routes/healthEvents";
import forumRoutes            from "./routes/Forum";
import notificationsRouter    from "./routes/Notifications";
import businessRoutes         from "./routes/Business";
import contactRouter          from "./routes/Contact";
import adminRouter            from "./routes/Admin";
import businessAuthRouter     from "./routes/Businessauth";
import businessPasswordRouter from "./routes/Businesspassword";
import businessDashboardRouter from "./routes/Businessdashboard";
import listingsRouter         from "./routes/Listings";
import buddiesRouter          from "./routes/buddies";
import dogsRouter             from "./routes/Dogs";
import reviewRouter           from "./routes/Reviews";
import profileRouter          from "./routes/ProfileRoutes";
import savedRouter            from "./routes/saved";

dotenv.config();

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("☁️  Cloudinary configured for:", process.env.CLOUDINARY_CLOUD_NAME ?? "⚠️  MISSING");

const app  = express();
const PORT = process.env.PORT || 4000;

// DB Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});
pool.on("connect", () => console.log("✅ PostgreSQL connected"));
pool.on("error",   (err) => console.error("❌ PostgreSQL error:", err));

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL ?? "https://barkbuddy.org.uk",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn("[CORS] Blocked origin:", origin);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

const walksRouter = require('./routes/walks_api');
app.use('/api/walks', walksRouter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads — with long-term cache headers
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  maxAge: "1y",
  immutable: true,
}));

// Static assets — with long-term cache headers
app.use("/assets", express.static(path.join(__dirname, "../assets"), {
  maxAge: "1y",
  immutable: true,
}));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// API routes
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

// GET /api/listings/new  — kept here only if NOT already in listingsRouter
app.get("/api/listings/new", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, category, image_url, city,
             rating, review_count, is_verified,
             ST_Y(location::geometry) AS lat,
             ST_X(location::geometry) AS lng
      FROM listings
      WHERE is_active = true AND is_verified = true
      ORDER BY created_at DESC
      LIMIT 3
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/listings/new error:", err);
    res.status(500).json({ error: "Failed to fetch new listings" });
  }
});

// GET /api/categories
app.get("/api/categories", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*) AS count
      FROM listings
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/autocomplete
app.get("/api/autocomplete", async (req, res) => {
  const q = (req.query.q as string) || "";
  if (q.length < 2) { res.json([]); return; }
  try {
    const [categoryResults, titleResults] = await Promise.all([
      pool.query(`
        SELECT DISTINCT category AS label, 'category' AS type, COUNT(*) AS count
        FROM listings
        WHERE category ILIKE $1 AND is_active = true
        GROUP BY category
        ORDER BY count DESC
        LIMIT 4
      `, [`%${q}%`]),
      pool.query(`
        SELECT DISTINCT title AS label, category AS type, city
        FROM listings
        WHERE title ILIKE $1 AND is_active = true
        LIMIT 4
      `, [`%${q}%`]),
    ]);
    res.json([...categoryResults.rows, ...titleResults.rows]);
  } catch (err) {
    console.error("GET /api/autocomplete error:", err);
    res.status(500).json({ error: "Autocomplete failed" });
  }
});

// Multer error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError || err?.message?.includes("Only JPG")) {
    res.status(400).json({ message: err.message });
    return;
  }
  next(err);
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Global error]", err);
  res.status(err.status ?? 500).json({
    message: err.message ?? "Internal server error",
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start 
app.listen(PORT, () => {
  console.log(`🚀 BarkBuddy server running on port ${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV ?? "development"}`);
  console.log(`   DATABASE: ${process.env.DATABASE_URL ? "✅ set" : "❌ MISSING"}`);
  console.log(`   JWT:      ${process.env.JWT_SECRET  ? "✅ set" : "❌ MISSING"}`);
  console.log(`   RESEND:   ${process.env.RESEND_API_KEY ? "✅ set" : "❌ MISSING"}`);
  console.log(`   CLOUDINARY: ${process.env.CLOUDINARY_CLOUD_NAME ? "✅ set" : "❌ MISSING"}`);
});

export default app;