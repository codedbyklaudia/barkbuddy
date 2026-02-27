require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ─────────────────────────────────────────────
// GET /api/listings
// ─────────────────────────────────────────────
app.get('/api/listings', async (req, res) => {
  try {
    const {
      q = '',
      category = '',
      lat,
      lng,
      radius = 25,
      min_rating = 0,
      verified_only = 'false',
      page = 1,
      limit = 9,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build params array and conditions separately
    // This avoids all parameter index confusion
    const params = [];
    const conditions = ['l.is_active = true'];

    // Helper to add a param and return its $N placeholder
    const addParam = (val) => {
      params.push(val);
      return `$${params.length}`;
    };

    // ── Keyword search ──
    // ILIKE with % is broad enough — 'vet' matches 'Vet Clinics', 'groo' matches 'Grooming'
    if (q && q.trim()) {
      const p1 = addParam(`%${q.trim()}%`);
      conditions.push(`(
        l.category ILIKE ${p1}
        OR l.title ILIKE ${p1}
        OR l.description ILIKE ${p1}
      )`);
    }

    // ── Category filter (icon clicks) ──
    if (category && category.trim()) {
      const p = addParam(`%${category.trim()}%`);
      conditions.push(`l.category ILIKE ${p}`);
    }

    // ── Min rating ──
    if (parseFloat(min_rating) > 0) {
      const p = addParam(parseFloat(min_rating));
      conditions.push(`l.rating >= ${p}`);
    }

    // ── Verified only ──
    if (verified_only === 'true') {
      conditions.push(`l.is_verified = true`);
    }

    // ── Location radius ──
    let distanceExpression = 'NULL';
    if (lat && lng) {
      const pLng = addParam(parseFloat(lng));
      const pLat = addParam(parseFloat(lat));
      const pRadius = addParam(parseFloat(radius) * 1000); // metres
      distanceExpression = `ST_Distance(l.location::geography, ST_MakePoint(${pLng}, ${pLat})::geography) / 1000`;
      conditions.push(`ST_DWithin(
        l.location::geography,
        ST_MakePoint(${pLng}, ${pLat})::geography,
        ${pRadius}
      )`);
    }

    const whereClause = conditions.join(' AND ');

    // ── Count ──
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM listings l WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // ── Main query ──
    const pLimit = addParam(parseInt(limit));
    const pOffset = addParam(offset);

    const orderBy = lat && lng ? 'distance_km ASC NULLS LAST' : 'l.created_at DESC';

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
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('GET /api/listings error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/listings/new
// ─────────────────────────────────────────────
app.get('/api/listings/new', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch new listings' });
  }
});

// ─────────────────────────────────────────────
// GET /api/listings/:id
// ─────────────────────────────────────────────
app.get('/api/listings/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
       FROM listings WHERE id = $1 AND is_active = true`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// ─────────────────────────────────────────────
// GET /api/categories
// ─────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*) AS count FROM listings
      WHERE is_active = true GROUP BY category ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ─────────────────────────────────────────────
// GET /api/autocomplete
// ─────────────────────────────────────────────
app.get('/api/autocomplete', async (req, res) => {
  const { q = '' } = req.query;
  if (q.length < 2) return res.json([]);
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
    res.status(500).json({ error: 'Autocomplete failed' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`BarkBuddy API running on port ${PORT}`));