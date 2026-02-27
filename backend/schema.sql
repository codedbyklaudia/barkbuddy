-- ═══════════════════════════════════════════════════════════
-- BarkBuddy DB Schema
-- Requires: PostgreSQL + PostGIS extension
-- Run: psql -U postgres -d barkbuddy -f schema.sql
-- ═══════════════════════════════════════════════════════════

-- Enable PostGIS for geo queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- for fuzzy text search

-- ─────────────────────────────────────────────
-- Listings table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  category      VARCHAR(100) NOT NULL,  -- 'Grooming' | 'Vet Clinics' | 'Pet shops' | 'Behaviorists' | 'Dog Parks' | 'Dog-Friendly Dining'
  address       VARCHAR(255),
  city          VARCHAR(100),
  postcode      VARCHAR(10),
  phone         VARCHAR(30),
  website       VARCHAR(255),
  image_url     VARCHAR(500),
  rating        DECIMAL(2,1) DEFAULT 0.0 CHECK (rating BETWEEN 0 AND 5),
  review_count  INTEGER DEFAULT 0,
  is_verified   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  location      GEOGRAPHY(POINT, 4326),  -- PostGIS geo point (lng, lat)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Indexes for performance
-- ─────────────────────────────────────────────

-- Spatial index for geo queries (ST_DWithin, ST_Distance)
CREATE INDEX IF NOT EXISTS listings_location_idx
  ON listings USING GIST(location);

-- Full-text search index
CREATE INDEX IF NOT EXISTS listings_fts_idx
  ON listings USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || category)
  );

-- Trigram index for ILIKE autocomplete
CREATE INDEX IF NOT EXISTS listings_title_trgm_idx
  ON listings USING GIN(title gin_trgm_ops);

-- Category filter index
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings(category);
CREATE INDEX IF NOT EXISTS listings_is_active_idx ON listings(is_active);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON listings(created_at DESC);

-- ─────────────────────────────────────────────
-- Auto-update updated_at trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- Seed data — sample UK listings
-- ST_MakePoint(longitude, latitude) — NOTE: lng first!
-- ─────────────────────────────────────────────
INSERT INTO listings (title, description, category, address, city, postcode, phone, image_url, rating, review_count, is_verified, location)
VALUES
  (
    'Grow Walkies Central London',
    'Premium dog walking service in Central London. Fully insured, GPS-tracked walks in Hyde Park, Regent''s Park, and surrounding areas. Small group and solo walks available.',
    'Dog Parks',
    '12 Park Lane',
    'London',
    'W1K 1AB',
    '020 7123 4567',
    '/images/grow-walkies.jpeg',
    4.8, 124, true,
    ST_MakePoint(-0.1499, 51.5034)
  ),
  (
    'CrabSushi Restaurant',
    'Dog-friendly Japanese restaurant with a dedicated outdoor terrace. Fresh sushi, ramen, and a special dog menu available. Water bowls and treats provided.',
    'Dog-Friendly Dining',
    '45 Brick Lane',
    'London',
    'E1 6PU',
    '020 7234 5678',
    '/images/restaurant1.jpg',
    4.5, 89, true,
    ST_MakePoint(-0.0714, 51.5219)
  ),
  (
    'PictureHouse Cinema',
    'Dog-friendly cinema screenings every Sunday morning. Bring your four-legged friend and enjoy the latest films in a relaxed environment.',
    'Entertainment',
    '68 Holly Bush Lane',
    'London',
    'NW3 6QN',
    '020 7435 1234',
    '/images/picturehouse.jpg',
    4.6, 57, true,
    ST_MakePoint(-0.1768, 51.5585)
  ),
  (
    'Pawfect Grooming Studio',
    'Luxury grooming salon for all breeds. Services include full groom, bath and dry, nail trim, and spa treatments. By appointment only.',
    'Grooming',
    '22 King''s Road',
    'London',
    'SW3 4TR',
    '020 7352 8888',
    '/images/grooming1.jpg',
    4.9, 203, true,
    ST_MakePoint(-0.1659, 51.4887)
  ),
  (
    'The Urban Vet',
    'Modern veterinary clinic offering routine checkups, vaccinations, dental care, and emergency services. Extended hours available.',
    'Vet Clinics',
    '5 Camden High Street',
    'London',
    'NW1 7JE',
    '020 7485 9999',
    '/images/vet1.jpg',
    4.7, 312, true,
    ST_MakePoint(-0.1422, 51.5392)
  ),
  (
    'Pets Corner Islington',
    'Independent pet shop with a curated selection of natural food, treats, and accessories. Expert staff for nutrition advice.',
    'Pet shops',
    '88 Upper Street',
    'London',
    'N1 0NP',
    '020 7359 7777',
    '/images/petshop1.jpg',
    4.4, 76, true,
    ST_MakePoint(-0.1043, 51.5383)
  );