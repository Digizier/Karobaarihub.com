import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function testProductInsert() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  console.log("Testing with string ID 'prod_123456789'...");
  const res1 = await supabase.from('products').upsert({
    id: "prod_123456789",
    name: "Test String ID",
    slug: "test-string-id",
    price: 999
  });
  console.log("String ID Error:", res1.error);

  console.log("\nTesting WITHOUT ID (letting Supabase generate UUID)...");
  const res2 = await supabase.from('products').insert({
    name: "Test Auto UUID",
    slug: "test-auto-uuid-" + Date.now(),
    price: 999
  }).select();
  console.log("Auto UUID Error:", res2.error);
  console.log("Auto UUID Data:", res2.data);
  if (res2.data) {
    await supabase.from('products').delete().eq('id', res2.data[0].id);
  }
}

testProductInsert();
