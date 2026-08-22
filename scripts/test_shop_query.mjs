import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function testShopQuery() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  const { data, count, error } = await supabase
    .from("products")
    .select("id, name, slug, price, sale_price, stock, rating, review_count, sales_count, thumbnail_url, category_name, category_slug, brand_name, is_flash_sale, is_featured, is_active, location_tag", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  console.log("Error:", error);
  console.log("Count:", count);
  console.log("Products returned:");
  data?.forEach(p => console.log(`- ${p.name} (PKR ${p.price}, slug: ${p.slug})`));
}

testShopQuery();
