import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function testEfadInsert() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  const payload = {
    name: "efad",
    slug: "efad",
    price: 999,
    sale_price: 799,
    stock: 25,
    category_slug: "mobiles-tablets",
    category_name: "Mobiles & Tablets",
    is_active: true
  };

  const { data, error } = await supabase.from('products').upsert(payload, { onConflict: 'slug' }).select();
  console.log("Upsert error:", error);
  console.log("Upserted product in Supabase:", data);
}

testEfadInsert();
