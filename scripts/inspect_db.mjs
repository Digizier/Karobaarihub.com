import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.cfxdpkvimmukacwyzpje:mgVLr%246*c%26%257SXw@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function inspectTables() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== BANNERS TABLE COLUMNS ===");
  const bCols = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'banners';
  `);
  bCols.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));

  console.log("\n=== ALL ROWS IN BANNERS ===");
  const bRows = await client.query(`SELECT * FROM banners;`);
  bRows.rows.forEach(r => console.log(r));

  console.log("\n=== ALL ROWS IN PROPERTIES ===");
  const propRows = await client.query(`SELECT id, title, slug, is_active, is_featured, created_at FROM properties;`);
  propRows.rows.forEach(r => console.log(r));

  await client.end();
}

inspectTables();
