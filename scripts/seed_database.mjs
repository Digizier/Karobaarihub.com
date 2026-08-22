import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.cfxdpkvimmukacwyzpje:mgVLr%246*c%26%257SXw@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function seed() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Seeding data into Supabase...");

  // 1. Categories
  const categories = [
    { name: "Mobiles & Tablets", slug: "mobiles-tablets", icon: "Smartphone" },
    { name: "Electronic Accessories", slug: "electronic-accessories", icon: "Headphones" },
    { name: "TV, Audio & Home Appliances", slug: "tv-audio-appliances", icon: "Tv" },
    { name: "Health & Beauty", slug: "health-beauty", icon: "Sparkles" },
    { name: "Men's Fashion", slug: "mens-fashion", icon: "Shirt" },
    { name: "Women's Fashion", slug: "womens-fashion", icon: "ShoppingBag" },
    { name: "Home & Lifestyle", slug: "home-lifestyle", icon: "Home" },
    { name: "Sports & Outdoor", slug: "sports-outdoor", icon: "Activity" },
    { name: "Baby, Kids & Toys", slug: "baby-kids-toys", icon: "Smile" },
    { name: "Groceries & Pets", slug: "groceries-pets", icon: "Apple" },
    { name: "Automotive & Motorbike", slug: "automotive-motorbike", icon: "Car" },
    { name: "Stationery & Office Supplies", slug: "stationery-office", icon: "BookOpen" },
  ];

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await client.query(`
      INSERT INTO public.categories (name, slug, icon, sort_order)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (slug) DO NOTHING;
    `, [c.name, c.slug, c.icon, i + 1]);
  }
  console.log("✓ Categories seeded!");

  // 2. Products
  const products = [
    {
      name: "Cloth Hanging Stand with Shoe Shelf & Heavy Duty Frame",
      slug: "cloth-hanging-stand-shoe-shelf",
      price: 3200,
      sale_price: 2649,
      stock: 45,
      rating: 4.8,
      sales_count: 128,
      thumbnail_url: "/assets/cloth-stand-1.jpeg",
      is_featured: true,
      is_flash_sale: true,
      category_slug: "home-lifestyle",
      short_description: "Premium metallic double-pole garment rack with lower tiers for shoes and storage organizer boxes."
    },
    {
      name: "Commercial Sublimation Heat Press Machine for T-Shirts & Mugs",
      slug: "sublimation-heat-press-machine-5-in-1",
      price: 48000,
      sale_price: 41500,
      stock: 12,
      rating: 4.9,
      sales_count: 34,
      thumbnail_url: "/assets/heat-press.jpeg",
      is_featured: true,
      is_flash_sale: false,
      category_slug: "electronic-accessories",
      short_description: "Industrial multi-function 5-in-1 combo heat press machine for printing garments, ceramic plates, caps, and mugs."
    },
    {
      name: "5 Pcs Unisex Casual Cotton T-Shirts Pack (Summer Collection)",
      slug: "5pcs-unisex-casual-tshirts-pack",
      price: 2499,
      sale_price: 1699,
      stock: 90,
      rating: 4.6,
      sales_count: 210,
      thumbnail_url: "/assets/tshirt-pack.jpeg",
      is_featured: false,
      is_flash_sale: true,
      category_slug: "mens-fashion",
      short_description: "Pack of 5 breathable 100% combed cotton plain round neck tee shirts for daily casual and work wear."
    },
    {
      name: "Wireless Bluetooth ANC Active Noise Cancelling Earbuds",
      slug: "wireless-bluetooth-anc-earbuds",
      price: 4999,
      sale_price: 2999,
      stock: 50,
      rating: 4.7,
      sales_count: 85,
      thumbnail_url: "/assets/earbuds.jpeg",
      is_featured: true,
      is_flash_sale: false,
      category_slug: "electronic-accessories",
      short_description: "Smart digital display ENC mic low latency wireless gaming earbuds with 36 hours total playback."
    },
    {
      name: "Multi-Functional 12-in-1 Vegetable Chopper & Slicer",
      slug: "12-in-1-vegetable-chopper-slicer",
      price: 1899,
      sale_price: 1299,
      stock: 60,
      rating: 4.5,
      sales_count: 140,
      thumbnail_url: "/assets/chopper.jpeg",
      is_featured: false,
      is_flash_sale: true,
      category_slug: "home-lifestyle",
      short_description: "Heavy duty kitchen manual food chopper with stainless steel blades, egg separator, and collection tray."
    },
    {
      name: "Smart Watch Ultra 2 with Amoled Display & Bluetooth Calling",
      slug: "smart-watch-ultra-2-amoled",
      price: 7500,
      sale_price: 4899,
      stock: 30,
      rating: 4.8,
      sales_count: 65,
      thumbnail_url: "/assets/smartwatch.jpeg",
      is_featured: true,
      is_flash_sale: false,
      category_slug: "electronic-accessories",
      short_description: "Titanium alloy casing sport smartwatch with heart rate monitoring, sleep tracker, multiple watch faces, and wireless magnetic charger."
    },
    {
      name: "Fast Charging 20000mAh Power Bank with Digital Display",
      slug: "fast-charging-20000mah-power-bank",
      price: 3999,
      sale_price: 2799,
      stock: 40,
      rating: 4.7,
      sales_count: 95,
      thumbnail_url: "/assets/powerbank.jpeg",
      is_featured: true,
      is_flash_sale: false,
      category_slug: "mobiles-tablets",
      short_description: "22.5W dual USB fast charging external battery backup pack with Type-C input/output and LED percentage indicator."
    }
  ];

  for (const p of products) {
    const catRes = await client.query(`SELECT id FROM public.categories WHERE slug = $1 LIMIT 1`, [p.category_slug]);
    const catId = catRes.rows[0]?.id || null;

    await client.query(`
      INSERT INTO public.products (
        name, slug, price, sale_price, stock, rating, sales_count, thumbnail_url, is_featured, is_flash_sale, short_description, category_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (slug) DO NOTHING;
    `, [p.name, p.slug, p.price, p.sale_price, p.stock, p.rating, p.sales_count, p.thumbnail_url, p.is_featured, p.is_flash_sale, p.short_description, catId]);
  }
  console.log("✓ Products seeded!");

  // 3. Properties
  const properties = [
    {
      title: "4 Marla Brand New Modern House in Shahpur, Adyala Road",
      slug: "4-marla-brand-new-house-shahpur",
      property_type: "House",
      status: "For Sale",
      location: "Shahpur, Adyala Road, Rawalpindi",
      area_marla: 4,
      price: 9500000,
      price_display: "PKR 95 Lakhs",
      bedrooms: 3,
      bathrooms: 4,
      kitchens: 2,
      description: "Double storey newly built family home with solid construction, marble flooring, woodwork, and underground water supply near Shahpur main market.",
      thumbnail_url: "/assets/shahpur-house.jpeg",
      is_featured: true
    },
    {
      title: "5 Marla Solid Construction Residential Plot in Bahria Town Phase 8",
      slug: "5-marla-plot-bahria-town-phase-8",
      property_type: "Plot",
      status: "For Sale",
      location: "Sector M, Bahria Town Phase 8, Rawalpindi",
      area_marla: 5,
      price: 6800000,
      price_display: "PKR 68 Lakhs",
      bedrooms: 0,
      bathrooms: 0,
      kitchens: 0,
      description: "Possession and utility-ready plot situated on 40 ft wide road near commercial area, mosque, and international standard park.",
      thumbnail_url: "/assets/bahria-plot.jpeg",
      is_featured: true
    },
    {
      title: "10 Marla Designer Luxury Villa in DHA Phase 2 Islamabad",
      slug: "10-marla-luxury-villa-dha-phase-2",
      property_type: "House",
      status: "For Sale",
      location: "Sector B, DHA Phase 2, Islamabad",
      area_marla: 10,
      price: 38000000,
      price_display: "PKR 3.80 Crore",
      bedrooms: 5,
      bathrooms: 6,
      kitchens: 2,
      description: "Ultra modern architectural masterpiece featuring imported Turkish fittings, automated security, basement home theater, and servant quarter.",
      thumbnail_url: "/assets/dha-villa.jpeg",
      is_featured: true
    },
    {
      title: "1 Kanal Prime Front Commercial Plot on Main Adyala Road",
      slug: "1-kanal-commercial-plot-adyala-road",
      property_type: "Commercial",
      status: "For Sale",
      location: "Main Adyala Road, Near Gorakhpur, Rawalpindi",
      area_marla: 20,
      price: 45000000,
      price_display: "PKR 4.50 Crore",
      bedrooms: 0,
      bathrooms: 0,
      kitchens: 0,
      description: "Direct road facing commercial land ideal for plaza, fuel station, bank branch, or departmental store with 120 ft wide frontage.",
      thumbnail_url: "/assets/commercial-plot.jpeg",
      is_featured: true
    }
  ];

  for (const pr of properties) {
    await client.query(`
      INSERT INTO public.properties (
        title, slug, property_type, status, location, area_marla, price, price_display, bedrooms, bathrooms, kitchens, description, thumbnail_url, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (slug) DO NOTHING;
    `, [pr.title, pr.slug, pr.property_type, pr.status, pr.location, pr.area_marla, pr.price, pr.price_display, pr.bedrooms, pr.bathrooms, pr.kitchens, pr.description, pr.thumbnail_url, pr.is_featured]);
  }
  console.log("✓ Properties seeded!");

  // 4. Digital Books
  const books = [
    {
      title: "E-Commerce Karobaar Guide Pakistan (From Zero to 1 Million PKR)",
      slug: "ecommerce-karobaar-guide-pakistan",
      author: "Karobaari Hub Academy",
      category: "Business",
      description: "A complete step-by-step master guide on product hunting in Shah Alam Market, local courier agreements (TCS, Leopard, Trax), Cash on Delivery cashflow management, and TikTok/Meta ads for Pakistani audience.",
      price: 1499,
      sale_price: 499,
      cover_url: "/assets/ebook-ecommerce.jpeg",
      file_format: "PDF",
      file_size_mb: 14.5,
      pages_count: 112,
      is_featured: true
    },
    {
      title: "Rawalpindi & Islamabad Real Estate Investment Blueprint (2025-2030)",
      slug: "real-estate-investment-rawalpindi-islamabad",
      author: "Prism Real Estate Research Wing",
      category: "Investment",
      description: "In-depth ROI breakdown, Ring Road impact analysis, CDA/RDA legal NOC verifications, and high-yield residential vs commercial plot projections across Adyala Road, Bahria, and DHA sectors.",
      price: 2500,
      sale_price: 899,
      cover_url: "/assets/ebook-realestate.jpeg",
      file_format: "PDF",
      file_size_mb: 22.0,
      pages_count: 148,
      is_featured: true
    },
    {
      title: "Modern Digital Marketing for Freelancers & Agency Owners",
      slug: "modern-digital-marketing-freelancers",
      author: "Syed Umair Ali",
      category: "Skill Learning",
      description: "Proven sales funnels, high-ticket international client outreach blueprints on LinkedIn, Upwork optimization strategies, and automated email nurturing templates.",
      price: 1800,
      sale_price: 650,
      cover_url: "/assets/ebook-marketing.jpeg",
      file_format: "PDF",
      file_size_mb: 18.2,
      pages_count: 96,
      is_featured: true
    }
  ];

  for (const b of books) {
    await client.query(`
      INSERT INTO public.digital_books (
        title, slug, author, category, description, price, sale_price, cover_url, file_format, file_size_mb, pages_count, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (slug) DO NOTHING;
    `, [b.title, b.slug, b.author, b.category, b.description, b.price, b.sale_price, b.cover_url, b.file_format, b.file_size_mb, b.pages_count, b.is_featured]);
  }
  console.log("✓ Digital Books seeded!");

  // 5. Courses
  const courses = [
    {
      title: "Mastering Pakistani E-Commerce & Dropshipping Masterclass",
      slug: "mastering-ecommerce-dropshipping-pakistan",
      short_description: "Practical Pakistani e-commerce curriculum by veteran sellers covering inventory sourcing, local Shopify setup, payment gateways, courier integrations, and ROI-driven ad funnels.",
      description: "Comprehensive 12-module masterclass designed to take you from total beginner to running a 7-figure e-commerce brand in Pakistan.",
      instructor: "Karobaari Hub Academy",
      level: "All Levels",
      duration: "14.5 Hours",
      modules_count: 12,
      lessons_count: 48,
      price: 8999,
      sale_price: 3499,
      thumbnail_url: "/assets/course-ecommerce.jpeg",
      is_featured: true
    },
    {
      title: "Real Estate Agent & Investor Masterclass (Twin Cities Special)",
      slug: "real-estate-agent-investor-masterclass",
      short_description: "Learn how to close high-ticket property deals, conduct legal land title verification (Fard, Registry, Intiqal), run client generation ads, and structure investor syndicates.",
      description: "Prism Real Estate certified professional real estate agency and investment course focusing on Rawalpindi and Islamabad markets.",
      instructor: "Prism Real Estate Academy",
      level: "Intermediate",
      duration: "10 Hours",
      modules_count: 8,
      lessons_count: 32,
      price: 12000,
      sale_price: 4999,
      thumbnail_url: "/assets/course-realestate.jpeg",
      is_featured: true
    }
  ];

  for (const c of courses) {
    await client.query(`
      INSERT INTO public.courses (
        title, slug, short_description, description, instructor, level, duration, modules_count, lessons_count, price, sale_price, thumbnail_url, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (slug) DO NOTHING;
    `, [c.title, c.slug, c.short_description, c.description, c.instructor, c.level, c.duration, c.modules_count, c.lessons_count, c.price, c.sale_price, c.thumbnail_url, c.is_featured]);
  }
  console.log("✓ Courses seeded!");

  await client.end();
  console.log("✓ ALL SEEDING COMPLETED SUCCESSFULLY IN SUPABASE CLOUD!");
}

seed();
