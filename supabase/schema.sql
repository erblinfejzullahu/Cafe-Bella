-- ============================================================
-- Cafe Bella — Clean Schema Reset
-- Run this in Supabase SQL Editor, then run seed.sql after
-- ============================================================

-- 1. Drop everything and start clean
DROP TABLE IF EXISTS reservations   CASCADE;
DROP TABLE IF EXISTS reviews        CASCADE;
DROP TABLE IF EXISTS order_items    CASCADE;
DROP TABLE IF EXISTS orders         CASCADE;
DROP TABLE IF EXISTS products       CASCADE;
DROP TABLE IF EXISTS categories     CASCADE;

-- 2. Categories
CREATE TABLE categories (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  icon          TEXT        DEFAULT '🍽️',
  description   TEXT,
  display_order INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products
CREATE TABLE products (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID        REFERENCES categories(id) ON DELETE SET NULL,
  name          TEXT        NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL,
  image_url     TEXT,
  is_available  BOOLEAN     DEFAULT TRUE,
  is_popular    BOOLEAN     DEFAULT FALSE,
  allergens     TEXT[]      DEFAULT '{}',
  calories      INTEGER,
  display_order INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders
CREATE TABLE orders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT        UNIQUE NOT NULL,
  customer_name    TEXT        NOT NULL,
  customer_email   TEXT,
  customer_phone   TEXT,
  order_type       TEXT        NOT NULL CHECK (order_type IN ('dine-in','takeaway','delivery')),
  status           TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','preparing','ready','delivered','rejected')),
  delivery_address TEXT,
  subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax              NUMERIC(10,2) NOT NULL DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  estimated_time   INTEGER,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Order items
CREATE TABLE order_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID        REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT        NOT NULL,
  product_price NUMERIC(10,2) NOT NULL,
  quantity      INTEGER     NOT NULL CHECK (quantity > 0),
  subtotal      NUMERIC(10,2) NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reviews
CREATE TABLE reviews (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT        NOT NULL,
  rating        INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  is_approved   BOOLEAN     DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Reservations
CREATE TABLE reservations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name    TEXT        NOT NULL,
  customer_email   TEXT,
  customer_phone   TEXT        NOT NULL,
  party_size       INTEGER     NOT NULL CHECK (party_size > 0),
  reservation_date DATE        NOT NULL,
  reservation_time TIME        NOT NULL,
  status           TEXT        DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Auto-update timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 9. Indexes
CREATE INDEX idx_products_category   ON products(category_id);
CREATE INDEX idx_products_available  ON products(is_available);
CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_created_at   ON orders(created_at DESC);
CREATE INDEX idx_order_items_order   ON order_items(order_id);

-- 10. GRANTS — explicit permissions for all Supabase roles
-- anon: public read + create orders/reviews
GRANT USAGE                          ON SCHEMA public TO anon;
GRANT SELECT                         ON categories, products, reviews TO anon;
GRANT SELECT, INSERT                 ON orders, order_items, reviews, reservations TO anon;

-- authenticated: same as anon + own profile
GRANT USAGE                          ON SCHEMA public TO authenticated;
GRANT SELECT                         ON categories, products TO authenticated;
GRANT SELECT, INSERT                 ON orders, order_items, reviews, reservations TO authenticated;

-- service_role: full access (used by our API routes)
GRANT USAGE                          ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES                 ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES                 ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 11. RLS — disable on write tables so grants alone control access
--     (service_role bypasses RLS anyway; disabling keeps it simple)
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items  DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

-- Public read policies for RLS-enabled tables
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_products"   ON products   FOR SELECT USING (true);

-- 12. Reload PostgREST schema cache — critical after SQL Editor changes
SELECT pg_notify('pgrst', 'reload schema');

-- Done! Run seed.sql next.
