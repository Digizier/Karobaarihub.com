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

async function verifyAllSlugs() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  // 1. Check product vcxvx
  const pFilter = buildSlugFilter("vcxvx", "vcxvx");
  const { data: pData, error: pErr } = await supabase.from('products').select('*').or(pFilter).limit(1).maybeSingle();
  console.log("1. Product 'vcxvx' Lookup:", pErr ? "FAILED: " + pErr.message : "SUCCESS -> " + pData?.name + " (Price: " + pData?.price + ")");

  // 2. Check property scad
  const propFilter = buildSlugFilter("scad", "scad");
  const { data: propData, error: propErr } = await supabase.from('properties').select('*').or(propFilter).limit(1).maybeSingle();
  console.log("2. Property 'scad' Lookup:", propErr ? "FAILED: " + propErr.message : "SUCCESS -> " + propData?.title + " (" + propData?.price_display + ")");

  // 3. Check digital book
  const bFilter = buildSlugFilter("ecommerce-karobaar-guide-pakistan", "ecommerce-karobaar-guide-pakistan");
  const { data: bData, error: bErr } = await supabase.from('digital_books').select('*').or(bFilter).limit(1).maybeSingle();
  console.log("3. E-Book Lookup:", bErr ? "FAILED: " + bErr.message : "SUCCESS -> " + bData?.title);

  // 4. Check course
  const cFilter = buildSlugFilter("mastering-ecommerce-dropshipping-pakistan", "mastering-ecommerce-dropshipping-pakistan");
  const { data: cData, error: cErr } = await supabase.from('courses').select('*').or(cFilter).limit(1).maybeSingle();
  console.log("4. Course Lookup:", cErr ? "FAILED: " + cErr.message : "SUCCESS -> " + cData?.title);
}

verifyAllSlugs();
