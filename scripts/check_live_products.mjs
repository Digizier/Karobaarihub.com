import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function checkProducts() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await supabase.from('products').select('*');
  console.log("Error:", error);
  console.log("Total Products in Supabase:", data?.length);
  data?.forEach(p => console.log(`- [${p.id}] ${p.name} (slug: ${p.slug}, is_active: ${p.is_active})`));
}

checkProducts();
