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
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard > Storage
-- =============================================
-- Bucket: product-images (public)
-- Bucket: product-videos (public)
-- Bucket: screenshots (private)
-- Bucket: shipping-proofs (private)

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Products: public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Auth users manage products" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Participants: public insert, admin read/update
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users read participants" ON participants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users update participants" ON participants FOR UPDATE USING (auth.role() = 'authenticated');

-- Orders: public insert, admin read/update
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users manage orders" ON orders FOR ALL USING (auth.role() = 'authenticated');

-- Winners: public read published, admin all
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published winners" ON winners FOR SELECT USING (is_published = true);
CREATE POLICY "Auth users manage winners" ON winners FOR ALL USING (auth.role() = 'authenticated');

-- Settings: public read, admin write
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Auth users update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

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

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SAMPLE DATA (optional - remove in production)
-- =============================================
INSERT INTO products (name, description, price, type, stock, images, is_featured) VALUES
  ('Dragon Miniature', 'Highly detailed 3D printed dragon miniature, perfect for tabletop gaming or display. Printed in premium PLA filament with stunning detail.', 35.00, 'SELL', 'in', ARRAY['https://placehold.co/600x600/f5e0c0/8b6340?text=🐉'], true),
  ('Nekoko Phone Stand', 'Ergonomic phone stand designed with kawaii cat ears. Supports all phone sizes. Available in multiple pastel colors.', 18.00, 'SELL', 'in', ARRAY['https://placehold.co/600x600/fce8e8/d95555?text=📱'], true),
  ('Lucky Vase Set', 'Beautiful geometric vase set — win it FREE! Subscribe to our YouTube channel and join the lucky draw. Pastel colors available.', 0, 'LUCKY_DRAW', 'in', ARRAY['https://placehold.co/600x600/e8f0e8/3d6b42?text=🏺'], true)
ON CONFLICT DO NOTHING;
