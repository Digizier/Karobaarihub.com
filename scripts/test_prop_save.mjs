import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function testPropertyInsert() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  const payload = {
    title: "Test Property Sync",
    slug: "test-property-sync-" + Date.now(),
    property_type: "House",
    status: "For Sale",
    area_marla: 5,
    price: 12000000,
    price_display: "PKR 1.2 Crore",
    location: "Shahpur, Rawalpindi",
    is_active: true
  };

  const { data, error } = await supabase.from('properties').upsert(payload, { onConflict: 'slug' }).select();
  console.log("Upsert Error:", error);
  console.log("Upsert Data:", data);
}

testPropertyInsert();
