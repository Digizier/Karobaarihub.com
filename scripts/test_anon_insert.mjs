import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function testAnonInsert() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  console.log("Testing insert with ANON KEY...");
  const { data, error } = await supabase.from('products').insert({
    name: "Test RLS Product",
    slug: "test-rls-product-" + Date.now(),
    price: 999
  }).select();

  console.log("Insert result with ANON KEY:");
  console.log("Error:", error);
  console.log("Data:", data);
}

testAnonInsert();
