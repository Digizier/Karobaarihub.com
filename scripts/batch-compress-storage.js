/**
 * Batch Storage Image Compressor & WebP Migrator
 * - Converts all uncompressed JPG, JPEG, PNG, JFIF images in karobaari-assets to lightweight WebP
 * - Resizes max dimensions to 1200px
 * - Updates references in products, properties, digital_books, courses, banners, categories
 * - Sets 1-year immutable cache header on Cloudflare CDN
 * - Removes heavy original files to free storage quota
 */

const sharp = require("sharp");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cfxdpkvimmukacwyzpje.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzMzMzQ1OSwiZXhwIjoyMTAyOTA5NDU5fQ.sOgUC4n8izMmAqJK1TbG6J1u4egsRVzh1owFtfMOLPo";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "karobaari-assets";

// Cache of already converted URLs to prevent duplicate uploads
const convertedMap = new Map();

async function convertImageToWebP(originalUrl) {
  if (!originalUrl || typeof originalUrl !== "string") return null;
  if (!originalUrl.includes(BUCKET)) return null; // Only process our bucket assets

  const cleanUrl = originalUrl.split("?")[0];
  const ext = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1).toLowerCase();

  // If already webp or non-image, skip
  if (ext === "webp" || !["jpg", "jpeg", "png", "jfif", "bmp"].includes(ext)) {
    return null;
  }

  // Check if we already converted this exact URL in this run
  if (convertedMap.has(originalUrl)) {
    return convertedMap.get(originalUrl);
  }

  try {
    // 1. Fetch original image
    const response = await fetch(originalUrl);
    if (!response.ok) {
      console.warn(`[SKIP] Could not fetch ${originalUrl}: ${response.statusText}`);
      return null;
    }
    const origBuffer = Buffer.from(await response.arrayBuffer());
    const origSize = origBuffer.length;

    // 2. Compress & convert to WebP using sharp
    const webpBuffer = await sharp(origBuffer)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    const webpSize = webpBuffer.length;

    // 3. Determine new storage path
    // e.g. products/1788409261254_evad8b.jpg -> products/1788409261254_evad8b.webp
    const urlObj = new URL(cleanUrl);
    const pathParts = urlObj.pathname.split(`/public/${BUCKET}/`)[1];
    if (!pathParts) return null;

    const newPath = pathParts.substring(0, pathParts.lastIndexOf(".")) + ".webp";

    // 4. Upload WebP to storage with 1-year immutable cache header
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(newPath, webpBuffer, {
      contentType: "image/webp",
      cacheControl: "31536000, public, immutable",
      upsert: true,
    });

    if (uploadError) {
      console.error(`[UPLOAD ERROR] ${newPath}:`, uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(newPath);
    const newPublicUrl = publicUrlData.publicUrl;

    // 5. Delete original uncompressed bulky file to save storage quota
    if (pathParts !== newPath) {
      try {
        await supabase.storage.from(BUCKET).remove([pathParts]);
      } catch (delErr) {
        // non-critical if deletion fails
      }
    }

    const result = {
      oldUrl: originalUrl,
      newUrl: newPublicUrl,
      origSize,
      webpSize,
      savedBytes: origSize - webpSize,
    };

    convertedMap.set(originalUrl, result);
    return result;
  } catch (err) {
    console.error(`[ERROR] Processing ${originalUrl}:`, err.message);
    return null;
  }
}

async function run() {
  console.log("=== STARTING CLOUD STORAGE IMAGE WEBP COMPRESSION ===");
  let totalOrigBytes = 0;
  let totalWebpBytes = 0;
  let convertedCount = 0;

  // 1. Process PRODUCTS
  console.log("\n1. Fetching all Products...");
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, thumbnail_url, images");

  if (prodErr) {
    console.error("Failed to fetch products:", prodErr);
    return;
  }

  console.log(`Found ${products.length} products to check.`);

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    let productUpdated = false;
    let newThumb = prod.thumbnail_url;
    let newImages = Array.isArray(prod.images) ? [...prod.images] : [];

    // Check thumbnail_url
    if (prod.thumbnail_url) {
      const res = await convertImageToWebP(prod.thumbnail_url);
      if (res) {
        newThumb = res.newUrl;
        productUpdated = true;
        totalOrigBytes += res.origSize;
        totalWebpBytes += res.webpSize;
        convertedCount++;
        process.stdout.write(
          `[Prod ${i + 1}/${products.length}] Thumb: ${(res.origSize / 1024).toFixed(0)}KB -> ${(res.webpSize / 1024).toFixed(0)}KB (-${(((res.origSize - res.webpSize) / res.origSize) * 100).toFixed(0)}%)\n`
        );
      }
    }

    // Check gallery images
    if (Array.isArray(prod.images)) {
      for (let j = 0; j < newImages.length; j++) {
        const imgItem = newImages[j];
        if (imgItem.public_url) {
          const res = await convertImageToWebP(imgItem.public_url);
          if (res) {
            newImages[j] = { ...imgItem, public_url: res.newUrl };
            productUpdated = true;
            totalOrigBytes += res.origSize;
            totalWebpBytes += res.webpSize;
            convertedCount++;
            process.stdout.write(
              `  [Gallery ${j + 1}/${newImages.length}] ${(res.origSize / 1024).toFixed(0)}KB -> ${(res.webpSize / 1024).toFixed(0)}KB (-${(((res.origSize - res.webpSize) / res.origSize) * 100).toFixed(0)}%)\n`
            );
          }
        }
      }
    }

    if (productUpdated) {
      await supabase
        .from("products")
        .update({
          thumbnail_url: newThumb,
          images: newImages,
        })
        .eq("id", prod.id);
    }
  }

  // 2. Process PROPERTIES
  console.log("\n2. Processing Real Estate Properties...");
  const { data: properties } = await supabase.from("properties").select("id, title, thumbnail_url");
  if (properties) {
    for (const prop of properties) {
      if (prop.thumbnail_url) {
        const res = await convertImageToWebP(prop.thumbnail_url);
        if (res) {
          await supabase.from("properties").update({ thumbnail_url: res.newUrl }).eq("id", prop.id);
          totalOrigBytes += res.origSize;
          totalWebpBytes += res.webpSize;
          convertedCount++;
        }
      }
    }
  }

  // 3. Process DIGITAL BOOKS
  console.log("\n3. Processing E-Books...");
  const { data: books } = await supabase.from("digital_books").select("id, title, cover_url");
  if (books) {
    for (const book of books) {
      if (book.cover_url) {
        const res = await convertImageToWebP(book.cover_url);
        if (res) {
          await supabase.from("digital_books").update({ cover_url: res.newUrl }).eq("id", book.id);
          totalOrigBytes += res.origSize;
          totalWebpBytes += res.webpSize;
          convertedCount++;
        }
      }
    }
  }

  // 4. Process COURSES
  console.log("\n4. Processing Courses...");
  const { data: courses } = await supabase.from("courses").select("id, title, thumbnail_url");
  if (courses) {
    for (const course of courses) {
      if (course.thumbnail_url) {
        const res = await convertImageToWebP(course.thumbnail_url);
        if (res) {
          await supabase.from("courses").update({ thumbnail_url: res.newUrl }).eq("id", course.id);
          totalOrigBytes += res.origSize;
          totalWebpBytes += res.webpSize;
          convertedCount++;
        }
      }
    }
  }

  // 5. Process BANNERS
  console.log("\n5. Processing Banners...");
  const { data: banners } = await supabase.from("banners").select("id, title, image_url");
  if (banners) {
    for (const ban of banners) {
      if (ban.image_url) {
        const res = await convertImageToWebP(ban.image_url);
        if (res) {
          await supabase.from("banners").update({ image_url: res.newUrl }).eq("id", ban.id);
          totalOrigBytes += res.origSize;
          totalWebpBytes += res.webpSize;
          convertedCount++;
        }
      }
    }
  }

  // 6. Process CATEGORIES
  console.log("\n6. Processing Categories...");
  const { data: categories } = await supabase.from("categories").select("id, name, image_url");
  if (categories) {
    for (const cat of categories) {
      if (cat.image_url) {
        const res = await convertImageToWebP(cat.image_url);
        if (res) {
          await supabase.from("categories").update({ image_url: res.newUrl }).eq("id", cat.id);
          totalOrigBytes += res.origSize;
          totalWebpBytes += res.webpSize;
          convertedCount++;
        }
      }
    }
  }

  console.log("\n=== COMPRESSION & WEBP MIGRATION COMPLETE ===");
  console.log(`Total Images Converted to WebP: ${convertedCount}`);
  console.log(`Original Storage Volume: ${(totalOrigBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Optimized WebP Volume: ${(totalWebpBytes / (1024 * 1024)).toFixed(2)} MB`);
  const totalSaved = totalOrigBytes - totalWebpBytes;
  console.log(`Storage Saved: ${(totalSaved / (1024 * 1024)).toFixed(2)} MB (${totalOrigBytes > 0 ? (((totalSaved) / totalOrigBytes) * 100).toFixed(1) : 0}%)`);
}

run();
