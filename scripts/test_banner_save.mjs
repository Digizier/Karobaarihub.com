import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function testBannerSave() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  // 1. Fetch existing banners
  const { data: list, error: listErr } = await supabase.from('banners').select('*').order('sort_order', { ascending: true });
  console.log("Current Banners in DB:", list?.length, "Error:", listErr);
  list?.forEach(b => console.log(`- [${b.id}] ${b.title} (img: ${b.image_url})`));

  // 2. Update second banner image if broken
  if (list && list.length >= 2) {
    const b2 = list[1];
    const { data: updated, error: updateErr } = await supabase
      .from('banners')
      .update({
        image_url: '/assets/shahpur-house.jpeg',
        subtitle: 'Direct owner listings in Shahpur, Bahria Town, and DHA with NOC verification.'
      })
      .eq('id', b2.id)
      .select();
    console.log("Updated banner 2:", updated ? "SUCCESS" : "FAILED", updateErr);
  }

  // 3. Update third banner image if broken
  if (list && list.length >= 3) {
    const b3 = list[2];
    const { data: updated3, error: updateErr3 } = await supabase
      .from('banners')
      .update({
        image_url: '/assets/course-thumb.jpeg',
        subtitle: 'Learn high-ticket skills and Pakistani e-commerce dropshipping secrets.'
      })
      .eq('id', b3.id)
      .select();
    console.log("Updated banner 3:", updated3 ? "SUCCESS" : "FAILED", updateErr3);
  }
}

testBannerSave();
