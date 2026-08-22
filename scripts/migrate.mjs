import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres:mgVLr%246*c%26%257SXw@db.cfxdpkvimmukacwyzpje.supabase.co:5432/postgres";

async function run() {
  console.log("Connecting to Supabase PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✓ Successfully connected to Supabase PostgreSQL database!");

    const sql = fs.readFileSync('supabase-schema.sql', 'utf8');
    console.log("Running supabase-schema.sql migration...");
    await client.query(sql);
    console.log("✓ Schema migration executed successfully!");

    // Verify tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("✓ Tables in public schema:");
    res.rows.forEach(r => console.log(`  - ${r.table_name}`));

    await client.end();
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
