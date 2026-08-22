import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.cfxdpkvimmukacwyzpje:mgVLr%246*c%26%257SXw@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function seedBannersAndVouchers() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const vouchers = [
    { code: "WELCOME30", title: "30% OFF First Order", discount_type: "percentage", discount_value: 30, min_spend: 1500, is_free_shipping: false },
    { code: "FREESHIP450", title: "Free Shipping Voucher", discount_type: "fixed", discount_value: 450, min_spend: 2500, is_free_shipping: true },
    { code: "KAROBAARI10", title: "10% Flat Discount", discount_type: "percentage", discount_value: 10, min_spend: 3000, is_free_shipping: false },
  ];

  for (const v of vouchers) {
    await client.query(`
      INSERT INTO public.vouchers (code, title, discount_type, discount_value, min_spend, is_free_shipping, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT (code) DO NOTHING;
    `, [v.code, v.title, v.discount_type, v.discount_value, v.min_spend, v.is_free_shipping]);
  }
  console.log("✓ Vouchers seeded in Supabase!");

  const banners = [
    { title: "Pakistan Mega Online Bazaar & Verified Properties", subtitle: "Buy direct, save big on wholesale rates and verified land assets.", image_url: "/assets/ecommerce-banner-1.jpeg", link_url: "/shop", cta_text: "Shop Marketplace", sort_order: 1 },
    { title: "Premium Real Estate in Rawalpindi & Islamabad", subtitle: "Direct owner listings in Shahpur, Bahria Town, and DHA with NOC verification.", image_url: "/assets/shahpur-house.jpeg", link_url: "/real-estate/properties", cta_text: "View Properties", sort_order: 2 },
    { title: "Knowledge Hub: Practical Business Books & Skill Courses", subtitle: "Learn high-ticket skills and Pakistani e-commerce dropshipping secrets.", image_url: "/assets/course-thumb.jpeg", link_url: "/courses", cta_text: "Explore Courses", sort_order: 3 },
  ];

  for (const b of banners) {
    await client.query(`
      INSERT INTO public.banners (title, subtitle, image_url, link_url, cta_text, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true);
    `, [b.title, b.subtitle, b.image_url, b.link_url, b.cta_text, b.sort_order]);
  }
  console.log("✓ Banners seeded in Supabase!");

  await client.end();
}

seedBannersAndVouchers();
