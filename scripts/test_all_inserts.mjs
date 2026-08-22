import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

function isValidUUID(id) {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

async function testAllInserts() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  // 1. Product
  const pPayload = {
    name: "Test Live Multi-Email Sync Item",
    slug: "test-live-sync-" + Date.now(),
    price: 1500,
    sale_price: 1200,
    stock: 30,
    is_active: true
  };
  const { data: pData, error: pErr } = await supabase.from('products').upsert(pPayload, { onConflict: 'slug' }).select().single();
  console.log("Product Insert:", pErr ? "FAILED: " + pErr.message : "SUCCESS (ID: " + pData.id + ")");

  // 2. Property
  const propPayload = {
    title: "Test Property Live Sync",
    slug: "test-prop-sync-" + Date.now(),
    property_type: "House",
    status: "For Sale",
    area_marla: 5,
    price: 12000000,
    price_display: "PKR 1.2 Crore",
    location: "Shahpur, Rawalpindi",
    is_active: true
  };
  const { data: propData, error: propErr } = await supabase.from('properties').upsert(propPayload, { onConflict: 'slug' }).select().single();
  console.log("Property Insert:", propErr ? "FAILED: " + propErr.message : "SUCCESS (ID: " + propData.id + ")");

  // 3. Digital Book
  const bPayload = {
    title: "Test E-Book Live Sync",
    slug: "test-book-sync-" + Date.now(),
    author: "Karobaari Academy",
    category: "Business",
    price: 500,
    is_active: true
  };
  const { data: bData, error: bErr } = await supabase.from('digital_books').upsert(bPayload, { onConflict: 'slug' }).select().single();
  console.log("E-Book Insert:", bErr ? "FAILED: " + bErr.message : "SUCCESS (ID: " + bData.id + ")");

  // 4. Course
  const cPayload = {
    title: "Test Course Live Sync",
    slug: "test-course-sync-" + Date.now(),
    instructor: "Karobaari Hub",
    price: 5000,
    is_active: true
  };
  const { data: cData, error: cErr } = await supabase.from('courses').upsert(cPayload, { onConflict: 'slug' }).select().single();
  console.log("Course Insert:", cErr ? "FAILED: " + cErr.message : "SUCCESS (ID: " + cData.id + ")");

  // 5. Category
  const catPayload = {
    name: "Test Cat Live Sync",
    slug: "test-cat-sync-" + Date.now(),
    is_active: true
  };
  const { data: catData, error: catErr } = await supabase.from('categories').upsert(catPayload, { onConflict: 'slug' }).select().single();
  console.log("Category Insert:", catErr ? "FAILED: " + catErr.message : "SUCCESS (ID: " + catData.id + ")");

  // Clean up test rows
  if (pData) await supabase.from('products').delete().eq('id', pData.id);
  if (propData) await supabase.from('properties').delete().eq('id', propData.id);
  if (bData) await supabase.from('digital_books').delete().eq('id', bData.id);
  if (cData) await supabase.from('courses').delete().eq('id', cData.id);
  if (catData) await supabase.from('categories').delete().eq('id', catData.id);
  console.log("✓ Cleaned up all test entities.");
}

testAllInserts();
