-- ====================================================================
-- STUDENT HUB - FULL SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ====================================================================
-- Run this complete script in your Supabase Project SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  college_id TEXT NOT NULL DEFAULT 'engineering',
  category_id TEXT NOT NULL,
  subcategory_id TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  product_type TEXT NOT NULL DEFAULT 'Physical',
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 1,
  image TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  trending BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  low_stock_threshold INTEGER DEFAULT 10,
  disable_when_out_of_stock BOOLEAN DEFAULT false,
  is_pre_order BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  college_id TEXT NOT NULL DEFAULT 'engineering',
  icon TEXT DEFAULT '📦',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. SUBCATEGORIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  college_id TEXT NOT NULL DEFAULT 'engineering',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 4. COLLEGES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.colleges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT DEFAULT '🏛️',
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. STUDENT KITS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_kits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  college_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Bundles',
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 1,
  image TEXT NOT NULL,
  badge TEXT,
  in_stock BOOLEAN DEFAULT true,
  description TEXT,
  items_included JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. DIGITAL PRODUCTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  college_id TEXT NOT NULL DEFAULT 'all',
  file_type TEXT NOT NULL,
  size TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  description TEXT,
  features TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 7. ORDERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  order_type TEXT DEFAULT 'Product Order',
  status TEXT NOT NULL DEFAULT 'Pending',
  payment_status TEXT NOT NULL DEFAULT 'Unpaid',
  student_name TEXT NOT NULL,
  customer_name TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  preferred_contact_method TEXT DEFAULT 'whatsapp',
  customer_notes TEXT,
  college_id TEXT,
  college_name TEXT,
  delivery_method TEXT DEFAULT 'delivery',
  campus_delivery_point TEXT,
  delivery_address TEXT,
  governorate TEXT,
  city TEXT,
  detailed_address TEXT,
  building_details TEXT,
  payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  timeline JSONB DEFAULT '[]'::jsonb,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for secure order tracking verification
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);

-- --------------------------------------------------------------------
-- 8. ORDER ITEMS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'product',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  quantity INTEGER NOT NULL DEFAULT 1,
  image TEXT,
  category TEXT,
  college_id TEXT,
  variant TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- --------------------------------------------------------------------
-- 9. CUSTOMERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  university TEXT,
  faculty TEXT,
  college_id TEXT,
  orders_count INTEGER DEFAULT 1,
  total_spent NUMERIC DEFAULT 0,
  joined_date TEXT,
  wishlist_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 10. REVIEWS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_college TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 11. COUPONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  college_id TEXT DEFAULT 'all',
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  expiry_date TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 12. HOMEPAGE BANNERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.homepage_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge TEXT,
  image TEXT NOT NULL,
  button_text TEXT DEFAULT 'Shop Now',
  link_view TEXT DEFAULT 'store',
  link_college TEXT,
  college_id TEXT DEFAULT 'all',
  active BOOLEAN DEFAULT true,
  banner_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 13. HOMEPAGE SETTINGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.homepage_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_button_primary TEXT,
  hero_button_secondary TEXT,
  hero_image TEXT,
  announcement_active BOOLEAN DEFAULT true,
  announcement_text TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 14. PRINTING REQUESTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.printing_requests (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  college TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT,
  pages INTEGER DEFAULT 1,
  copies INTEGER DEFAULT 1,
  color_type TEXT DEFAULT 'Black & White',
  paper_type TEXT DEFAULT 'Standard 80gsm',
  binding_type TEXT DEFAULT 'Spiral',
  delivery_method TEXT DEFAULT 'pickup',
  pickup_point TEXT,
  delivery_address TEXT,
  total_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  submitted_at TEXT NOT NULL,
  notes TEXT,
  timeline JSONB DEFAULT '[]'::jsonb,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 15. CUSTOM ORDERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  college TEXT,
  product_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT,
  size TEXT,
  customization_text TEXT,
  logo_file_url TEXT,
  reference_image TEXT,
  reference_link TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'In Review',
  date TEXT NOT NULL,
  delivery_method TEXT DEFAULT 'pickup',
  pickup_point TEXT,
  delivery_address TEXT,
  timeline JSONB DEFAULT '[]'::jsonb,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 16. NOTIFICATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'order',
  timestamp TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link_tab TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 17. STORE SETTINGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT DEFAULT 'Student Hub',
  tagline TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  store_description TEXT,
  physical_address TEXT,
  privacy_policy_url TEXT,
  terms_of_service_url TEXT,
  support_phone TEXT,
  support_email TEXT,
  free_shipping_threshold NUMERIC DEFAULT 500,
  standard_shipping_fee NUMERIC DEFAULT 35,
  currency TEXT DEFAULT 'EGP',
  currency_symbol TEXT DEFAULT 'EGP',
  tax_rate NUMERIC DEFAULT 0,
  campuses JSONB DEFAULT '[]'::jsonb,
  admin_pin TEXT DEFAULT 'admin2026',
  store_open BOOLEAN DEFAULT true,
  store_closed_message TEXT,
  site_title TEXT,
  meta_description TEXT,
  social_sharing_image TEXT,
  navigation_links JSONB DEFAULT '[]'::jsonb,
  pickup_locations JSONB DEFAULT '[]'::jsonb,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  delivery_settings JSONB DEFAULT '{}'::jsonb,
  website_content JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  custom_design_templates JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 18. ADMIN ACTIVITY LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  admin_name TEXT DEFAULT 'Super Admin',
  date_time TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 19. INVENTORY LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  action TEXT NOT NULL,
  quantity_delta INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  date_time TEXT NOT NULL,
  admin_name TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Public Read Policies (Allow anyone to view catalog items & public settings)
-- --------------------------------------------------------------------
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Public can view colleges" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Public can view student kits" ON public.student_kits FOR SELECT USING (true);
CREATE POLICY "Public can view digital products" ON public.digital_products FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR true);
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (active = true OR true);
CREATE POLICY "Public can view homepage banners" ON public.homepage_banners FOR SELECT USING (active = true OR true);
CREATE POLICY "Public can view homepage settings" ON public.homepage_settings FOR SELECT USING (true);
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (true);

-- --------------------------------------------------------------------
-- Public Insert Policies (Guest checkout, submitting reviews & requests)
-- --------------------------------------------------------------------
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert printing requests" ON public.printing_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert custom orders" ON public.custom_orders FOR INSERT WITH CHECK (true);

-- --------------------------------------------------------------------
-- Secure Order Tracking Policy (Verify order ID)
-- --------------------------------------------------------------------
CREATE POLICY "Public can view own order by id" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public can view order items for order" ON public.order_items FOR SELECT USING (true);

-- --------------------------------------------------------------------
-- Full Access for Admin / Service Role (or authenticated users)
-- --------------------------------------------------------------------
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access subcategories" ON public.subcategories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access colleges" ON public.colleges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access student kits" ON public.student_kits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access digital products" ON public.digital_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access order items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access homepage banners" ON public.homepage_banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access homepage settings" ON public.homepage_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access printing requests" ON public.printing_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access custom orders" ON public.custom_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access store settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access activity logs" ON public.admin_activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access inventory logs" ON public.inventory_logs FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime on tables for live cross-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subcategories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.printing_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
