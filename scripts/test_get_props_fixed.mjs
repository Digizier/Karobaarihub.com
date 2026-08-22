import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function testGetPropertiesFixed() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  let query = supabase
    .from("properties")
    .select("id, title, slug, property_type, status, area_marla, price, price_display, location, bedrooms, bathrooms, kitchens, is_featured, thumbnail_url, features, is_active, created_at", { count: "exact" })
    .eq("is_active", true);

  query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });

  const { data, error } = await query.range(0, 5);
  console.log("Error:", error);
  console.log("Returned count:", data?.length);
  data?.forEach(p => console.log(`- [${p.title}] (${p.price_display}, slug: ${p.slug}, created_at: ${p.created_at})`));
}

testGetPropertiesFixed();
