import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.cfxdpkvimmukacwyzpje:mgVLr%246*c%26%257SXw@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function addYoutubeCol() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(`
    ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500);
  `);
  console.log("✓ courses table youtube_url column added!");

  await client.end();
}

addYoutubeCol();
