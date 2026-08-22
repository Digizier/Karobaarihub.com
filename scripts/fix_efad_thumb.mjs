import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function updateEfadThumbnail() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await supabase
    .from('products')
    .update({ thumbnail_url: '/assets/cloth-stand-1.jpeg' })
    .eq('slug', 'efad')
    .select();

  console.log("Updated efad:", data, "Error:", error);
}

updateEfadThumbnail();
