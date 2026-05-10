-- ============================================================
-- Cafe Bella — Stored Procedures
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Create a full order with items in one call
CREATE OR REPLACE FUNCTION create_order(order_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id   UUID := (order_data->>'id')::UUID;
  v_item JSONB;
  v_row  JSONB;
BEGIN
  INSERT INTO orders (
    id, order_number, customer_name, customer_email, customer_phone,
    order_type, status, delivery_address, subtotal, tax, total, notes
  ) VALUES (
    v_id,
    order_data->>'order_number',
    order_data->>'customer_name',
    NULLIF(order_data->>'customer_email', ''),
    order_data->>'customer_phone',
    order_data->>'order_type',
    'pending',
    NULLIF(order_data->>'delivery_address', ''),
    (order_data->>'subtotal')::NUMERIC,
    (order_data->>'tax')::NUMERIC,
    (order_data->>'total')::NUMERIC,
    NULLIF(order_data->>'notes', '')
  );

  FOR v_item IN SELECT * FROM jsonb_array_elements(order_data->'items') LOOP
    INSERT INTO order_items (
      order_id, product_id, product_name, product_price, quantity, subtotal, notes
    ) VALUES (
      v_id,
      CASE WHEN (v_item->>'product_id') IS NOT NULL AND (v_item->>'product_id') != 'null'
           THEN (v_item->>'product_id')::UUID ELSE NULL END,
      v_item->>'product_name',
      (v_item->>'product_price')::NUMERIC,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'subtotal')::NUMERIC,
      NULLIF(v_item->>'notes', '')
    );
  END LOOP;

  SELECT to_jsonb(o) INTO v_row FROM orders o WHERE o.id = v_id;
  RETURN v_row;
END;
$$;

-- Update order status (admin)
CREATE OR REPLACE FUNCTION update_order_status(
  p_id               UUID,
  p_status           TEXT,
  p_estimated_time   INTEGER DEFAULT NULL,
  p_rejection_reason TEXT    DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row JSONB;
BEGIN
  UPDATE orders SET
    status           = p_status,
    estimated_time   = COALESCE(p_estimated_time,   estimated_time),
    rejection_reason = COALESCE(p_rejection_reason, rejection_reason),
    updated_at       = NOW()
  WHERE id = p_id;

  SELECT to_jsonb(o) INTO v_row FROM orders o WHERE o.id = p_id;
  RETURN v_row;
END;
$$;

-- Create a product (admin)
CREATE OR REPLACE FUNCTION create_product(product_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id  UUID := gen_random_uuid();
  v_row JSONB;
BEGIN
  INSERT INTO products (
    id, category_id, name, description, price, image_url,
    is_available, is_popular, allergens, calories, display_order
  ) VALUES (
    v_id,
    NULLIF(product_data->>'category_id', '')::UUID,
    product_data->>'name',
    NULLIF(product_data->>'description', ''),
    (product_data->>'price')::NUMERIC,
    NULLIF(product_data->>'image_url', ''),
    COALESCE((product_data->>'is_available')::BOOLEAN, TRUE),
    COALESCE((product_data->>'is_popular')::BOOLEAN, FALSE),
    '{}',
    NULLIF(product_data->>'calories', '')::INTEGER,
    COALESCE((product_data->>'display_order')::INTEGER, 0)
  );

  SELECT to_jsonb(p) INTO v_row FROM products p WHERE p.id = v_id;
  RETURN v_row;
END;
$$;

-- Update a product (admin)
CREATE OR REPLACE FUNCTION update_product(p_id UUID, product_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row JSONB;
BEGIN
  UPDATE products SET
    name          = COALESCE(product_data->>'name',        name),
    description   = COALESCE(product_data->>'description', description),
    price         = COALESCE((product_data->>'price')::NUMERIC, price),
    image_url     = COALESCE(product_data->>'image_url',   image_url),
    is_available  = COALESCE((product_data->>'is_available')::BOOLEAN, is_available),
    is_popular    = COALESCE((product_data->>'is_popular')::BOOLEAN,   is_popular),
    category_id   = COALESCE(NULLIF(product_data->>'category_id','')::UUID, category_id),
    calories      = COALESCE(NULLIF(product_data->>'calories','')::INTEGER, calories),
    display_order = COALESCE((product_data->>'display_order')::INTEGER, display_order),
    updated_at    = NOW()
  WHERE id = p_id;

  SELECT to_jsonb(p) INTO v_row FROM products p WHERE p.id = p_id;
  RETURN v_row;
END;
$$;

-- Delete a product (admin)
CREATE OR REPLACE FUNCTION delete_product(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM products WHERE id = p_id;
  RETURN FOUND;
END;
$$;

-- Submit a review (public)
CREATE OR REPLACE FUNCTION submit_review(
  p_customer_name TEXT,
  p_rating        INTEGER,
  p_comment       TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id  UUID := gen_random_uuid();
  v_row JSONB;
BEGIN
  INSERT INTO reviews (id, customer_name, rating, comment, is_approved)
  VALUES (v_id, p_customer_name, p_rating, p_comment, FALSE);

  SELECT to_jsonb(r) INTO v_row FROM reviews r WHERE r.id = v_id;
  RETURN v_row;
END;
$$;

-- Grant execute to all roles
GRANT EXECUTE ON FUNCTION create_order(JSONB)                            TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_order_status(UUID, TEXT, INTEGER, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_product(JSONB)                          TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_product(UUID, JSONB)                    TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_product(UUID)                           TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION submit_review(TEXT, INTEGER, TEXT)             TO anon, authenticated, service_role;

-- Reload PostgREST cache so functions are immediately available
SELECT pg_notify('pgrst', 'reload schema');
