import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import passwordRoutes from "./routes//password";
import healthEventsRoutes from "./routes/healthEvents";
import forumRoutes from "./routes/Forum";
import notificationsRouter from "./routes/Notifications";
import businessRoutes from "./routes/Business";
import contactRouter from './routes/Contact';
import adminRouter       from './routes/Admin';
import businessAuthRouter from './routes/Businessauth';
import businessPasswordRouter from './routes/Businesspassword';
import businessDashboardRouter from './routes/Businessdashboard';
import listingsRouter from './routes/Listings';
import buddiesRouter from "./routes/buddies";
import dogsRouter from "./routes/Dogs";
import reviewRouter from "./routes/Reviews";
import profileRouter from "./routes/ProfileRoutes";
import savedRouter from "./routes/saved";
import multer from "multer";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 4000;

// DB Pool (for service finder routes)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors({
  origin: "*",
  credentials: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/saved", savedRouter);
app.use("/api/users", usersRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/health-events", healthEventsRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/business", businessRoutes);
app.use('/api/contact', contactRouter);
app.use('/api/admin',    adminRouter);
app.use('/api/business', businessAuthRouter);
app.use('/api/business/password', businessPasswordRouter);
app.use('/api/business/dashboard', businessDashboardRouter);
app.use('/api/listings', listingsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/buddies", buddiesRouter);
app.use("/api/dogs", dogsRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/users", profileRouter);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", timestamp: new Date() }));

// SERVICE FINDER ROUTES
app.get("/api/listings", async (req, res) => {
  try {
    const {
      q             = "",
      category      = "",
      lat,
      lng,
      radius        = "25",
      min_rating    = "0",
      verified_only = "false",
      page          = "1",
      limit         = "9",
    } = req.query as Record<string, string>;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const params: any[]        = [];
    const conditions: string[] = ["l.is_active = true"];

    const addParam = (val: any) => {
      params.push(val);
      return `$${params.length}`;
    };

    if (q && q.trim()) {
      const p1 = addParam(`%${q.trim()}%`);
      conditions.push(`(
        l.category ILIKE ${p1}
        OR l.title ILIKE ${p1}
        OR l.description ILIKE ${p1}
      )`);
    }

    if (category && category.trim()) {
      const p = addParam(`%${category.trim()}%`);
      conditions.push(`l.category ILIKE ${p}`);
    }

    if (parseFloat(min_rating) > 0) {
      const p = addParam(parseFloat(min_rating));
      conditions.push(`l.rating >= ${p}`);
    }

    if (verified_only === "true") {
      conditions.push("l.is_verified = true");
    }

    let distanceExpression = "NULL";
    if (lat && lng) {
      const pLng    = addParam(parseFloat(lng));
      const pLat    = addParam(parseFloat(lat));
      const pRadius = addParam(parseFloat(radius) * 1000);
      distanceExpression = `ST_Distance(l.location::geography, ST_MakePoint(${pLng}, ${pLat})::geography) / 1000`;
      conditions.push(`ST_DWithin(
        l.location::geography,
        ST_MakePoint(${pLng}, ${pLat})::geography,
        ${pRadius}
      )`);
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM listings l WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const pLimit  = addParam(parseInt(limit));
    const pOffset = addParam(offset);
    const orderBy = lat && lng ? "distance_km ASC NULLS LAST" : "l.created_at DESC";

    const result = await pool.query(`
      SELECT
        l.id, l.title, l.description, l.category,
        l.address, l.city, l.postcode, l.phone, l.website,
        l.image_url, l.rating, l.review_count, l.is_verified, l.created_at,
        ST_Y(l.location::geometry) AS lat,
        ST_X(l.location::geometry) AS lng,
        ${distanceExpression} AS distance_km
      FROM listings l
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${pLimit} OFFSET ${pOffset}
    `, params);

    res.json({
      listings: result.rows,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err: any) {
    console.error("GET /api/listings error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/listings/new
app.get("/api/listings/new", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, category, image_url, city,
        rating, review_count, is_verified,
        ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
      FROM listings
      WHERE is_active = true AND is_verified = true
      ORDER BY created_at DESC LIMIT 3
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch new listings" });
  }
});

// GET /api/listings/:id
app.get("/api/listings/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
       FROM listings WHERE id = $1 AND is_active = true`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

// GET /api/categories
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

// GET /api/autocomplete
app.get("/api/autocomplete", async (req, res) => {
  const q = (req.query.q as string) || "";
  if (q.length < 2) { res.json([]); return; }
  try {
    const categoryResults = await pool.query(`
      SELECT DISTINCT category AS label, 'category' AS type, COUNT(*) AS count
      FROM listings WHERE category ILIKE $1 AND is_active = true
      GROUP BY category ORDER BY count DESC LIMIT 4
    `, [`%${q}%`]);

    const titleResults = await pool.query(`
      SELECT DISTINCT title AS label, category AS type, city
      FROM listings WHERE title ILIKE $1 AND is_active = true LIMIT 4
    `, [`%${q}%`]);

    res.json([...categoryResults.rows, ...titleResults.rows]);
  } catch (err) {
    res.status(500).json({ error: "Autocomplete failed" });
  }
});

// 404
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// Start
app.listen(PORT, () => {
  console.log(`🚀 BarkBuddy server running on http://localhost:${PORT}`);
});

export default app;