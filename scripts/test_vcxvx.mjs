import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

function isValidUUID(id) {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function buildSlugFilter(slug, clean) {
  const parts = [`slug.eq.${slug}`];
  if (clean && clean !== slug) parts.push(`slug.eq.${clean}`);
  if (isValidUUID(slug)) parts.push(`id.eq.${slug}`);
  return parts.join(",");
}

async function testVcxvx() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const slug = "vcxvx";
  const clean = "vcxvx";

  const filter = buildSlugFilter(slug, clean);
  console.log("Safe filter:", filter);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(filter)
    .limit(1)
    .maybeSingle();

  console.log("Error:", error);
  console.log("Product Found:", data?.name, "(PKR " + data?.price + ", Slug: " + data?.slug + ")");
}

testVcxvx();
