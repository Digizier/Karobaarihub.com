import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.cfxdpkvimmukacwyzpje:mgVLr%246*c%26%257SXw@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function fixRLS() {
  console.log("Connecting to Supabase PostgreSQL to configure open RLS policies...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const tables = [
    'categories',
    'products',
    'product_variants',
    'product_images',
    'properties',
    'property_images',
    'property_inquiries',
    'digital_books',
    'courses',
    'orders',
    'order_items',
    'banners',
    'vouchers',
    'reviews',
    'testimonials',
    'site_settings'
  ];

  for (const table of tables) {
    console.log(`Configuring RLS for table: ${table}...`);
    // Drop old policies
    await client.query(`
      DROP POLICY IF EXISTS "Public read active ${table}" ON public.${table};
      DROP POLICY IF EXISTS "Admin manage ${table}" ON public.${table};
      DROP POLICY IF EXISTS "Allow all operations for anon and authenticated" ON public.${table};
      DROP POLICY IF EXISTS "Public full access" ON public.${table};
      
      -- Create universal policy for anon and authenticated API clients
      CREATE POLICY "Public full access" ON public.${table}
      FOR ALL
      USING (true)
      WITH CHECK (true);
    `);
  }

  // Insert default site settings key-values
  const defaultSettings = [
    { key: "site_name", value: "Karobaari Hub" },
    { key: "hotline", value: "+92 335 9939702" },
    { key: "whatsapp_number", value: "+92 335 9939702" },
    { key: "contact_email", value: "karobaarihub@gmail.com" },
    { key: "address", value: "Main Stop Shahpur, Adyala Road, Rawalpindi / Islamabad, Pakistan" },
    { key: "currency", value: "PKR" },
    { key: "delivery_charge_standard", value: "199" },
    { key: "free_shipping_threshold", value: "3000" }
  ];

  for (const s of defaultSettings) {
    await client.query(`
      INSERT INTO public.site_settings (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `, [s.key, s.value]);
  }

  console.log("✓ All 16 table RLS policies successfully updated to allow real-time cloud sync!");
  await client.end();
}

fixRLS();
