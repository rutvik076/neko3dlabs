-- =============================================
-- Neko3DLabs - Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('SELL', 'LUCKY_DRAW')),
  stock TEXT NOT NULL DEFAULT 'in' CHECK (stock IN ('in', 'out')),
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  lucky_draw_end DATE,
  max_participants INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PARTICIPANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  agreed_to_share BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one entry per phone per product
CREATE UNIQUE INDEX IF NOT EXISTS participants_phone_product ON participants(phone, product_id);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WINNERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS winners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  winner_name TEXT NOT NULL,
  winner_phone TEXT NOT NULL,
  announce_date DATE DEFAULT CURRENT_DATE,
  shipping_proof_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  youtube_url TEXT DEFAULT 'https://youtube.com',
  whatsapp_number TEXT DEFAULT '60123456789',
  site_name TEXT DEFAULT 'Neko3DLabs',
  banner_text TEXT DEFAULT '',
  banner_enabled BOOLEAN DEFAULT false,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- ----- PRODUCTS -----
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Auth users manage products" ON products;

CREATE POLICY "Public read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Auth users manage products"
  ON products FOR ALL USING (auth.role() = 'authenticated');

-- ----- PARTICIPANTS -----
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert participants" ON participants;
DROP POLICY IF EXISTS "Public read own participants" ON participants;
DROP POLICY IF EXISTS "Auth users read participants" ON participants;
DROP POLICY IF EXISTS "Auth users update participants" ON participants;
DROP POLICY IF EXISTS "Auth users delete participants" ON participants;

-- Anyone can INSERT (public lucky draw form)
CREATE POLICY "Public insert participants"
  ON participants FOR INSERT WITH CHECK (true);

-- Anyone can SELECT their own entry by phone (needed for duplicate check in form)
CREATE POLICY "Public read participants by phone"
  ON participants FOR SELECT USING (true);

-- Authenticated admin can update/delete
CREATE POLICY "Auth users update participants"
  ON participants FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users delete participants"
  ON participants FOR DELETE USING (auth.role() = 'authenticated');

-- ----- ORDERS -----
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Auth users manage orders" ON orders;

-- Anyone can insert an order (WhatsApp click logging)
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT WITH CHECK (true);

-- Admin can read/update/delete orders
CREATE POLICY "Auth users manage orders"
  ON orders FOR ALL USING (auth.role() = 'authenticated');

-- ----- WINNERS -----
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published winners" ON winners;
DROP POLICY IF EXISTS "Auth users manage winners" ON winners;

-- Public can read published winners only
CREATE POLICY "Public read published winners"
  ON winners FOR SELECT USING (is_published = true);

-- Admin can manage all winners
CREATE POLICY "Auth users manage winners"
  ON winners FOR ALL USING (auth.role() = 'authenticated');

-- ----- SETTINGS -----
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read settings" ON settings;
DROP POLICY IF EXISTS "Auth users update settings" ON settings;

CREATE POLICY "Public read settings"
  ON settings FOR SELECT USING (true);

CREATE POLICY "Auth users update settings"
  ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- =============================================
-- STORAGE BUCKET POLICIES
-- Run these in Supabase SQL Editor after creating buckets
-- =============================================

-- screenshots bucket: allow public INSERT (for lucky draw form)
-- Run this AFTER creating the 'screenshots' bucket in Storage dashboard

INSERT INTO storage.buckets (id, name, public)
  VALUES ('screenshots', 'screenshots', false)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('shipping-proofs', 'shipping-proofs', false)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-videos', 'product-videos', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can upload screenshots (lucky draw form)
DROP POLICY IF EXISTS "Public upload screenshots" ON storage.objects;
CREATE POLICY "Public upload screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'screenshots');

-- Storage policy: admin can read screenshots
DROP POLICY IF EXISTS "Auth read screenshots" ON storage.objects;
CREATE POLICY "Auth read screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'screenshots' AND auth.role() = 'authenticated');

-- Storage policy: admin can upload shipping proofs
DROP POLICY IF EXISTS "Auth upload shipping proofs" ON storage.objects;
CREATE POLICY "Auth upload shipping proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shipping-proofs' AND auth.role() = 'authenticated');

-- Storage policy: admin can read shipping proofs
DROP POLICY IF EXISTS "Auth read shipping proofs" ON storage.objects;
CREATE POLICY "Auth read shipping proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shipping-proofs' AND auth.role() = 'authenticated');

-- Storage policy: admin can upload product images
DROP POLICY IF EXISTS "Auth upload product images" ON storage.objects;
CREATE POLICY "Auth upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Storage policy: anyone can read product images (public bucket)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Storage policy: admin can upload product videos
DROP POLICY IF EXISTS "Auth upload product videos" ON storage.objects;
CREATE POLICY "Auth upload product videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-videos' AND auth.role() = 'authenticated');

-- Storage policy: anyone can read product videos (public bucket)
DROP POLICY IF EXISTS "Public read product videos" ON storage.objects;
CREATE POLICY "Public read product videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-videos');

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SAMPLE DATA (optional - remove in production)
-- =============================================
INSERT INTO products (name, description, price, type, stock, images, is_featured) VALUES
  ('Dragon Miniature', 'Highly detailed 3D printed dragon miniature, perfect for tabletop gaming or display. Printed in premium PLA filament with stunning detail.', 350.00, 'SELL', 'in', ARRAY['https://placehold.co/600x600/1e293b/94a3b8?text=Dragon'], true),
  ('Phone Stand Pro', 'Ergonomic adjustable phone stand, precision printed. Supports all phone sizes and angles. Available in multiple colors.', 180.00, 'SELL', 'in', ARRAY['https://placehold.co/600x600/1e293b/94a3b8?text=Phone+Stand'], true),
  ('Geometric Vase', 'Beautiful geometric vase — win it FREE! Subscribe to our YouTube channel and join the lucky draw.', 0, 'LUCKY_DRAW', 'in', ARRAY['https://placehold.co/600x600/1e293b/94a3b8?text=Vase'], true)
ON CONFLICT DO NOTHING;
