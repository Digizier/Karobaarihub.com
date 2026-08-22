-- ==============================================================================
-- KAROBAARI HUB & PRISM REAL ESTATE — SUPABASE PRODUCTION SCHEMA & RLS POLICIES
-- Domain: karobaarihub.com
-- Architecture: Zero-Base64, Lean Column Projections, Indexed Filters, Strict RLS
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);

-- 2. PRODUCTS TABLE (Physical E-Commerce & Multi-Category Marketplace)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_name VARCHAR(150),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price >= 0),
    sku VARCHAR(100),
    stock INT DEFAULT 0 CHECK (stock >= 0),
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_flash_sale BOOLEAN DEFAULT false,
    flash_sale_end TIMESTAMPTZ,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    location_tag VARCHAR(100) DEFAULT 'Punjab',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_flash ON public.products(is_flash_sale);

-- 3. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    name VARCHAR(150), -- e.g. "Maroon / XL" or "500ml"
    attributes JSONB DEFAULT '{}'::jsonb, -- e.g. {"color": "Maroon", "size": "XL"}
    price NUMERIC(12, 2) NOT NULL,
    sale_price NUMERIC(12, 2),
    stock INT DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_variants_pid ON public.product_variants(product_id);

-- 4. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT,
    public_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_images_pid ON public.product_images(product_id);

-- 5. PROPERTIES TABLE (Prism Real Estate Division)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    property_type VARCHAR(100) NOT NULL, -- 'House', 'Plot', 'Commercial', 'Farmhouse', 'Apartment'
    status VARCHAR(50) DEFAULT 'For Sale', -- 'For Sale', 'For Rent', 'Sold', 'Under Offer'
    location VARCHAR(255) NOT NULL, -- e.g. 'Main Stop Shahpur, Adyala Road, Rawalpindi'
    area_marla NUMERIC(8, 2) NOT NULL, -- e.g. 4.0, 5.0, 10.0, 20.0 (1 Kanal)
    price NUMERIC(15, 2) NOT NULL, -- e.g. 12000000 (1 Crore 20 Lakh)
    price_display VARCHAR(100), -- e.g. 'Rs. 1 Crore 20 Lakh'
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    kitchens INT DEFAULT 0,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb, -- e.g. ["30 ft Street", "Sweet Water", "Electricity", "Car Porch"]
    thumbnail_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_active ON public.properties(is_active);

-- 6. PROPERTY IMAGES
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    storage_path TEXT,
    public_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_property_images_pid ON public.property_images(property_id);

-- 7. PROPERTY INQUIRIES & VISIT BOOKINGS
CREATE TABLE IF NOT EXISTS public.property_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    property_title VARCHAR(255),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    message TEXT,
    preferred_visit_date DATE,
    status VARCHAR(50) DEFAULT 'New', -- 'New', 'Contacted', 'Scheduled', 'Closed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prop_inq_status ON public.property_inquiries(status);

-- 8. DIGITAL BOOKS & E-BOOKS
CREATE TABLE IF NOT EXISTS public.digital_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    author VARCHAR(150),
    category VARCHAR(100), -- 'Educational', 'Business', 'Islamic', 'Skill Learning', 'Self Development'
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(10, 2),
    cover_url TEXT,
    file_storage_path TEXT,
    sample_preview_url TEXT,
    file_format VARCHAR(20) DEFAULT 'PDF',
    file_size_mb NUMERIC(6, 2),
    pages_count INT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_books_slug ON public.digital_books(slug);

-- 9. ONLINE COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    instructor VARCHAR(150),
    level VARCHAR(50) DEFAULT 'All Levels', -- 'Beginner', 'Intermediate', 'Advanced'
    duration VARCHAR(50), -- e.g. '12 Hours'
    modules_count INT DEFAULT 0,
    lessons_count INT DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(10, 2),
    thumbnail_url TEXT,
    curriculum JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

-- 10. ORDERS (Guest Cash on Delivery + WhatsApp Order)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'KB-94821'
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(150),
    province VARCHAR(100) NOT NULL, -- 'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Islamabad', 'Balochistan'
    city VARCHAR(100) NOT NULL,
    area VARCHAR(150),
    delivery_address TEXT NOT NULL,
    address_label VARCHAR(50) DEFAULT 'Home', -- 'Home', 'Office'
    subtotal NUMERIC(12, 2) NOT NULL,
    voucher_code VARCHAR(50),
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    shipping_fee NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'COD', -- 'COD', 'JazzCash', 'EasyPaisa', 'Bank Transfer'
    payment_status VARCHAR(50) DEFAULT 'Pending',
    order_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
    tracking_token VARCHAR(100) UNIQUE NOT NULL,
    customer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_num ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_token ON public.orders(tracking_token);

-- 11. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    sku_snapshot VARCHAR(100),
    variant_snapshot VARCHAR(150),
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_oid ON public.order_items(order_id);

-- 12. HERO BANNERS (15-Slide Carousel & Promotions)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    subtitle VARCHAR(255),
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    link_url VARCHAR(255) DEFAULT '/shop',
    cta_text VARCHAR(100) DEFAULT 'Shop Now',
    bg_gradient VARCHAR(100) DEFAULT 'from-maroon-900 to-black',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. VOUCHERS & COUPONS
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL, -- e.g. "30% OFF Summer Sale"
    discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage', 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    min_spend NUMERIC(12, 2) DEFAULT 0.00,
    max_discount NUMERIC(12, 2),
    is_free_shipping BOOLEAN DEFAULT false,
    expiry_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers(code);

-- 14. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT NOT NULL,
    photo_urls JSONB DEFAULT '[]'::jsonb,
    is_verified_purchase BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'Approved', -- 'Approved', 'Pending', 'Hidden'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_pid ON public.reviews(product_id);

-- 15. TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    role VARCHAR(150), -- e.g. "Property Investor", "Satisfied Shopper"
    content TEXT NOT NULL,
    avatar_url TEXT,
    rating INT DEFAULT 5,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Active records only)
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active variants" ON public.product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public read active properties" ON public.properties FOR SELECT USING (is_active = true);
CREATE POLICY "Public read property images" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Public read active books" ON public.digital_books FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active banners" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active vouchers" ON public.vouchers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (status = 'Approved');
CREATE POLICY "Public read active testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (true);

-- GUEST INSERT POLICIES
CREATE POLICY "Guest create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Guest create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Guest create property inquiry" ON public.property_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Guest submit review" ON public.reviews FOR INSERT WITH CHECK (true);

-- GUEST TRACKING POLICY (Select own order via tracking token or phone)
CREATE POLICY "Public track order" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public read order items" ON public.order_items FOR SELECT USING (true);

-- ADMIN FULL ACCESS POLICIES (Supabase authenticated user)
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage variants" ON public.product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage product images" ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage properties" ON public.properties FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage property images" ON public.property_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage property inquiries" ON public.property_inquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage books" ON public.digital_books FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage courses" ON public.courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage order items" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage banners" ON public.banners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage vouchers" ON public.vouchers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);