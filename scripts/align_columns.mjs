import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.cfxdpkvimmukacwyzpje:mgVLr%246*c%26%257SXw@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function alignColumns() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("Adding missing helper columns to all tables in Supabase...");

  // Products
  await client.query(`
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_slug VARCHAR(255);
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_name VARCHAR(255);
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;
  `);
  console.log("✓ products columns aligned!");

  // Properties
  await client.query(`
    ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS price NUMERIC(15, 2);
    ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS price_display VARCHAR(100);
    ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
  `);
  console.log("✓ properties columns aligned!");

  // Courses
  await client.query(`
    ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS curriculum JSONB DEFAULT '[]'::jsonb;
  `);
  console.log("✓ courses columns aligned!");

  // Orders
  await client.query(`
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2) DEFAULT 0;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(12, 2) DEFAULT 199;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'COD';
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending';
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS province VARCHAR(100) DEFAULT 'Punjab';
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Rawalpindi';
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address_label VARCHAR(50) DEFAULT 'Home';
  `);
  console.log("✓ orders columns aligned!");

  // Vouchers
  await client.query(`
    ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT 'Special Voucher';
  `);
  console.log("✓ vouchers columns aligned!");

  await client.end();
  console.log("✓ ALL COLUMNS FULLY ALIGNED WITH FRONTEND TYPES!");
}

alignColumns();
