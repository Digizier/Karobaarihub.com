import pg from 'pg';
const { Client } = pg;

const regions = [
  "ap-south-1",
  "ap-southeast-1",
  "eu-central-1",
  "us-east-1",
  "us-west-1",
  "me-central-1",
  "eu-west-1",
  "eu-west-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "sa-east-1",
  "ca-central-1"
];

async function check() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.cfxdpkvimmukacwyzpje:mgVLr%246*c%26%257SXw@${host}:6543/postgres`;
    console.log(`Trying ${region}...`);
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000
    });
    try {
      await client.connect();
      console.log(`✓ Connected successfully via pooler region: ${region}!`);
      return client;
    } catch (e) {
      console.log(`  Failed ${region}: ${e.message}`);
    }
  }
}

check();
