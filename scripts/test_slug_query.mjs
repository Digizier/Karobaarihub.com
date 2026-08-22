import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function testGetProductBySlug() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const slug = "efad";
  const clean = "efad";

  console.log("Testing with id.eq in .or filter...");
  const res1 = await supabase
    .from("products")
    .select("*")
    .or(`slug.eq.${slug},slug.eq.${clean},id.eq.${slug}`)
    .limit(1)
    .maybeSingle();
  console.log("Query 1 (with id.eq) Error:", res1.error);
  console.log("Query 1 (with id.eq) Data:", res1.data?.name);

  console.log("\nTesting WITHOUT id.eq (or only if valid UUID)...");
  const res2 = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  console.log("Query 2 (safe slug.eq) Error:", res2.error);
  console.log("Query 2 (safe slug.eq) Data:", res2.data?.name);
}

testGetProductBySlug();
