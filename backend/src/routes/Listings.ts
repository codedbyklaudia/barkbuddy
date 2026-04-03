import { Router, Request, Response } from "express";
import pool from "../db";
import { geocodeUKAddress } from "../utils/geocode";

const router = Router();

// Geocode a search location string 
async function geocodeSearchLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  const trimmed = location.trim();
  if (!trimmed) return null;

  // 1. Full UK postcode (e.g. "E1 6RF")
  const postcodeMatch = trimmed.match(/^([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i);
  if (postcodeMatch) {
    const pc = postcodeMatch[1].replace(/\s+/, " ").toUpperCase();
    try {
      const res  = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`);
      const data = await res.json() as any;
      if (data.status === 200) return { lat: data.result.latitude, lng: data.result.longitude };
    } catch {}
  }

  // 2. Outward code only (e.g. "E1", "SW1A")
  const outwardMatch = trimmed.match(/^([A-Z]{1,2}\d[A-Z\d]?)$/i);
  if (outwardMatch) {
    try {
      const res  = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(outwardMatch[1].toUpperCase())}`);
      const data = await res.json() as any;
      if (data.status === 200) return { lat: data.result.latitude, lng: data.result.longitude };
    } catch {}
  }

  // 3. Place / city / area name
  try {
    const res  = await fetch(`https://api.postcodes.io/places?q=${encodeURIComponent(trimmed)}&limit=1`);
    const data = await res.json() as any;
    if (data.status === 200 && data.result?.length > 0) {
      return { lat: parseFloat(data.result[0].latitude), lng: parseFloat(data.result[0].longitude) };
    }
  } catch {}

  // 4. Partial postcode autocomplete
  try {
    const res  = await fetch(`https://api.postcodes.io/postcodes?q=${encodeURIComponent(trimmed)}&limit=1`);
    const data = await res.json() as any;
    if (data.status === 200 && data.result?.length > 0) {
      return { lat: data.result[0].latitude, lng: data.result[0].longitude };
    }
  } catch {}

  return null;
}

// ─── Haversine distance expression (returns km) ───────────────────────────────
const distExpr = (latP: string, lngP: string) => `
  (6371 * acos(LEAST(1, cos(radians(${latP})) * cos(radians(ba.lat)) *
    cos(radians(ba.lng) - radians(${lngP})) +
    sin(radians(${latP})) * sin(radians(ba.lat)))))
`;

// ─── GET /api/listings/services ──────────────────────────────────────────────
// IMPORTANT: Specific routes MUST come BEFORE generic /:id route!
router.get("/services", async (req: Request, res: Response) => {
  const {
    search   = "",
    type     = "",
    location = "",
    lat, lng,
    radius   = "10",
    new_only = "false",
  } = req.query as Record<string, string>;

  try {
    let searchLat: number | null = null;
    let searchLng: number | null = null;

    if (lat && lng) {
      searchLat = parseFloat(lat);
      searchLng = parseFloat(lng);
    } else if (location.trim()) {
      const coords = await geocodeSearchLocation(location.trim());
      if (coords) { searchLat = coords.lat; searchLng = coords.lng; }
    }

    const radiusKm    = Math.min(parseFloat(radius) || 10, 100);
    const hasLocation = searchLat !== null && searchLng !== null;
    const newOnly     = new_only === "true";

    const params: any[] = [];
    let p = 1;

    let distanceSql    = "NULL::numeric";
    let distanceFilter = "";
    let orderBy        = "ba.approved_at DESC";

    if (hasLocation) {
      params.push(searchLat, searchLng);
      distanceSql    = `ROUND(CAST(${distExpr(`$1`, `$2`)} AS numeric), 1)`;
      distanceFilter = `AND ba.lat IS NOT NULL AND ba.lng IS NOT NULL AND ${distExpr(`$1`, `$2`)} <= $3`;
      params.push(radiusKm);
      orderBy = `${distExpr(`$1`, `$2`)} ASC`;
      p = 4;
    }

    const searchVal = search.trim() || null;
    const typeVal   = type.trim()   || null;
    params.push(searchVal); const searchP = p++;
    params.push(typeVal);   const typeP   = p++;

    const sql = `
      SELECT
        ba.id, ba.business_name, ba.type, ba.address, ba.postcode,
        ba.lat, ba.lng, ba.contact_phone, ba.contact_email, ba.website,
        ba.description, ba.approved_at,
        bsd.price_list,
        (SELECT file_path FROM business_photos
         WHERE business_id = ba.id AND is_primary = true LIMIT 1) AS primary_photo,
        (SELECT COUNT(*) FROM business_photos WHERE business_id = ba.id)::int AS photo_count,
        (ba.approved_at > NOW() - INTERVAL '30 days') AS is_new,
        ${distanceSql} AS distance_km
      FROM business_accounts ba
      LEFT JOIN business_service_details bsd ON bsd.business_id = ba.id
      WHERE ba.status     = 'approved'
        AND ba.category   = 'services'
        AND ba.deleted_at IS NULL
        AND ($${searchP}::text IS NULL
             OR ba.business_name ILIKE '%' || $${searchP} || '%'
             OR ba.description   ILIKE '%' || $${searchP} || '%'
             OR ba.address       ILIKE '%' || $${searchP} || '%'
             OR ba.postcode      ILIKE '%' || $${searchP} || '%'
             OR ba.type          ILIKE '%' || $${searchP} || '%')
        AND ($${typeP}::text IS NULL OR ba.type ILIKE $${typeP})
        ${distanceFilter}
        ${newOnly ? "AND ba.approved_at > NOW() - INTERVAL '30 days'" : ""}
      ORDER BY ${orderBy}
    `;

    const { rows } = await pool.query(sql, params);

    res.json({
      services: rows,
      meta: {
        total:         rows.length,
        searchLat,
        searchLng,
        radiusKm:      hasLocation ? radiusKm : null,
        locationFound: hasLocation,
      },
    });
  } catch (err) {
    console.error("Services listing error:", err);
    res.status(500).json({ message: "Failed to load services." });
  }
});

// ─── GET /api/listings/activities ────────────────────────────────────────────
router.get("/activities", async (req: Request, res: Response) => {
  const {
    search   = "",
    type     = "",
    location = "",
    lat, lng,
    radius   = "10",
    new_only = "false",
  } = req.query as Record<string, string>;

  try {
    let searchLat: number | null = null;
    let searchLng: number | null = null;

    if (lat && lng) {
      searchLat = parseFloat(lat);
      searchLng = parseFloat(lng);
    } else if (location.trim()) {
      const coords = await geocodeSearchLocation(location.trim());
      if (coords) { searchLat = coords.lat; searchLng = coords.lng; }
    }

    const radiusKm    = Math.min(parseFloat(radius) || 10, 100);
    const hasLocation = searchLat !== null && searchLng !== null;
    const newOnly     = new_only === "true";

    const params: any[] = [];
    let p = 1;
    let distanceSql    = "NULL::numeric";
    let distanceFilter = "";
    let orderBy        = "ba.approved_at DESC";

    if (hasLocation) {
      params.push(searchLat, searchLng);
      distanceSql    = `ROUND(CAST(${distExpr(`$1`, `$2`)} AS numeric), 1)`;
      distanceFilter = `AND ba.lat IS NOT NULL AND ba.lng IS NOT NULL AND ${distExpr(`$1`, `$2`)} <= $3`;
      params.push(radiusKm);
      orderBy = `${distExpr(`$1`, `$2`)} ASC`;
      p = 4;
    }

    const searchVal = search.trim() || null;
    const typeVal   = type.trim()   || null;
    params.push(searchVal); const searchP = p++;
    params.push(typeVal);   const typeP   = p++;

    const sql = `
      SELECT
        ba.id, ba.business_name, ba.type, ba.address, ba.postcode,
        ba.lat, ba.lng, ba.contact_phone, ba.contact_email, ba.website,
        ba.description, ba.approved_at,
        (SELECT file_path FROM business_photos
         WHERE business_id = ba.id AND is_primary = true LIMIT 1) AS primary_photo,
        (SELECT COUNT(*) FROM business_photos WHERE business_id = ba.id)::int AS photo_count,
        (ba.approved_at > NOW() - INTERVAL '30 days') AS is_new,
        ${distanceSql} AS distance_km
      FROM business_accounts ba
      WHERE ba.status     = 'approved'
        AND ba.category   = 'activities'
        AND ba.deleted_at IS NULL
        AND ($${searchP}::text IS NULL
             OR ba.business_name ILIKE '%' || $${searchP} || '%'
             OR ba.description   ILIKE '%' || $${searchP} || '%'
             OR ba.address       ILIKE '%' || $${searchP} || '%'
             OR ba.postcode      ILIKE '%' || $${searchP} || '%'
             OR ba.type          ILIKE '%' || $${searchP} || '%')
        AND ($${typeP}::text IS NULL OR ba.type ILIKE $${typeP})
        ${distanceFilter}
        ${newOnly ? "AND ba.approved_at > NOW() - INTERVAL '30 days'" : ""}
      ORDER BY ${orderBy}
    `;

    const { rows } = await pool.query(sql, params);

    res.json({
      activities: rows,
      meta: { total: rows.length, searchLat, searchLng, radiusKm: hasLocation ? radiusKm : null, locationFound: hasLocation },
    });
  } catch (err) {
    console.error("Activities listing error:", err);
    res.status(500).json({ message: "Failed to load activities." });
  }
});

// ─── GET /api/listings/services/:id ──────────────────────────────────────────
router.get("/services/:id", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT ba.id, ba.business_name, ba.type, ba.address, ba.postcode,
              ba.lat, ba.lng, ba.contact_phone, ba.contact_email, ba.website,
              ba.description, ba.approved_at,
              bsd.price_list, bsd.additional_info,
              (ba.approved_at > NOW() - INTERVAL '30 days') AS is_new
       FROM business_accounts ba
       LEFT JOIN business_service_details bsd ON bsd.business_id = ba.id
       WHERE ba.id = $1 AND ba.status = 'approved' AND ba.category = 'services' AND ba.deleted_at IS NULL`,
      [req.params.id]
    );
    if (rows.length === 0) { res.status(404).json({ message: "Not found" }); return; }
    const { rows: photos } = await pool.query(
      "SELECT file_path, caption, is_primary FROM business_photos WHERE business_id = $1 ORDER BY is_primary DESC, created_at ASC",
      [req.params.id]
    );
    res.json({ service: rows[0], photos });
  } catch { res.status(500).json({ message: "Failed to load service." }); }
});

// ─── GET /api/listings/activities/:id ────────────────────────────────────────
router.get("/activities/:id", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT ba.id, ba.business_name, ba.type, ba.address, ba.postcode,
              ba.lat, ba.lng, ba.contact_phone, ba.contact_email, ba.website,
              ba.description, ba.approved_at,
              (ba.approved_at > NOW() - INTERVAL '30 days') AS is_new
       FROM business_accounts ba
       WHERE ba.id = $1 AND ba.status = 'approved' AND ba.category = 'activities' AND ba.deleted_at IS NULL`,
      [req.params.id]
    );
    if (rows.length === 0) { res.status(404).json({ message: "Not found" }); return; }
    const { rows: photos } = await pool.query(
      "SELECT file_path, caption, is_primary FROM business_photos WHERE business_id = $1 ORDER BY is_primary DESC, created_at ASC",
      [req.params.id]
    );
    res.json({ activity: rows[0], photos });
  } catch { res.status(500).json({ message: "Failed to load activity." }); }
});

// ─── GET /api/listings/:id (UNIFIED) ─────────────────────────────────────────
// IMPORTANT: This MUST be LAST because it matches ANY /:id pattern
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const businessResult = await pool.query(
      `SELECT 
        id, business_name, type, category, address, postcode,
        lat, lng, contact_phone, contact_email, website,
        description, approved_at, status,
        (approved_at > NOW() - INTERVAL '30 days') AS is_new
       FROM business_accounts 
       WHERE id = $1 AND status = 'approved' AND deleted_at IS NULL`,
      [id]
    );

    if (businessResult.rows.length === 0) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    const business = businessResult.rows[0];

    const photosResult = await pool.query(
      `SELECT id, file_path, caption, is_primary 
       FROM business_photos 
       WHERE business_id = $1 
       ORDER BY is_primary DESC, created_at ASC`,
      [id]
    );

    const reviewsResult = await pool.query(
      `SELECT 
        id, user_name, user_email, rating, comment, created_at
       FROM reviews 
       WHERE business_id = $1 AND deleted_at IS NULL 
       ORDER BY created_at DESC`,
      [id]
    );

    const statsResult = await pool.query(
      `SELECT 
        AVG(rating)::NUMERIC(3,2) as average_rating, 
        COUNT(*) as total_reviews
       FROM reviews 
       WHERE business_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    const statistics = statsResult.rows[0] || { average_rating: 0, total_reviews: 0 };

    res.json({
      business,
      photos:     photosResult.rows,
      reviews:    reviewsResult.rows,
      statistics,
    });
  } catch (err) {
    console.error("Error fetching listing details:", err);
    res.status(500).json({ error: 'Failed to fetch listing details' });
  }
});

// ─── POST /api/listings/geocode-existing ──────────────────────────────────────
router.post("/geocode-existing", async (req: Request, res: Response) => {
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
    res.status(401).json({ message: "Unauthorised" }); return;
  }
  try {
    const { rows } = await pool.query(
      "SELECT id, address, postcode FROM business_accounts WHERE lat IS NULL AND deleted_at IS NULL"
    );
    let success = 0, failed = 0;
    for (const biz of rows) {
      const coords = await geocodeUKAddress(biz.address, biz.postcode).catch(() => null);
      if (coords) {
        await pool.query(
          "UPDATE business_accounts SET lat = $1, lng = $2 WHERE id = $3",
          [coords.lat, coords.lng, biz.id]
        );
        success++;
      } else { failed++; }
      await new Promise(r => setTimeout(r, 50));
    }
    res.json({ message: `Geocoded ${success}. Failed: ${failed}.`, success, failed });
  } catch (err) {
    console.error("Geocode existing error:", err);
    res.status(500).json({ message: "Failed." });
  }
});

export default router;