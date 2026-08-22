import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.cfxdpkvimmukacwyzpje:mgVLr%246*c%26%257SXw@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function run() {
  console.log("Connecting to Supabase PostgreSQL (ap-northeast-1)...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✓ Connected to Supabase!");

    let sql = fs.readFileSync('supabase-schema.sql', 'utf8');
    sql = sql.replace(/^\uFEFF/, '').trim();
    console.log("Executing schema SQL...");
    await client.query(sql);
    console.log("✓ Schema migration executed successfully!");

    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("✓ Live Tables created in Supabase:");
    tables.rows.forEach(r => console.log(`  - ${r.table_name}`));

    await client.end();
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
