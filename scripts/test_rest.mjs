import fs from 'fs';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzMzMzQ1OSwiZXhwIjoyMTAyOTA5NDU5fQ.sOgUC4n8izMmAqJK1TbG6J1u4egsRVzh1owFtfMOLPo";

async function test() {
  console.log("Testing Supabase REST / pg endpoint...");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`
    }
  });
  console.log("REST status:", res.status);
  const data = await res.json().catch(() => null);
  console.log("REST response:", data);
}

test();
