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

async function runComprehensiveAudit() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  console.log("=== COMPREHENSIVE LIVE SUPABASE AUDIT ===");

  // 1. Products
  const { data: prods, error: pErr } = await supabase.from('products').select('*').eq('is_active', true);
  console.log(`\n1. Products (${prods?.length || 0} items, Error: ${pErr?.message || 'None'}):`);
  prods?.forEach(p => console.log(`   - ${p.name} (PKR ${p.price}, slug: ${p.slug})`));

  // 2. Properties
  const { data: props, error: prErr } = await supabase.from('properties').select('id, title, slug, property_type, status, area_marla, price, price_display, location, bedrooms, bathrooms, kitchens, is_featured, thumbnail_url, features, is_active, created_at').eq('is_active', true).order('created_at', { ascending: false });
  console.log(`\n2. Properties (${props?.length || 0} items, Error: ${prErr?.message || 'None'}):`);
  props?.forEach(p => console.log(`   - ${p.title} (${p.price_display}, slug: ${p.slug})`));

  // 3. Banners
  const { data: banners, error: bErr } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true });
  console.log(`\n3. Hero Banners (${banners?.length || 0} items, Error: ${bErr?.message || 'None'}):`);
  banners?.forEach(b => console.log(`   - [Order ${b.sort_order}] ${b.title} (img: ${b.image_url})`));

  // 4. Slug lookups
  console.log("\n4. Live Dynamic Slug Lookups:");
  const testSlugs = [
    { table: 'products', slug: 'vcxvx' },
    { table: 'properties', slug: 'dd' },
    { table: 'properties', slug: 'scad' }
  ];
  for (const item of testSlugs) {
    const filter = buildSlugFilter(item.slug, item.slug);
    const { data, error } = await supabase.from(item.table).select('*').or(filter).limit(1).maybeSingle();
    console.log(`   - ${item.table} slug '${item.slug}': ${error ? 'ERROR: ' + error.message : 'SUCCESS -> ' + (data?.name || data?.title)}`);
  }
}

runComprehensiveAudit();
