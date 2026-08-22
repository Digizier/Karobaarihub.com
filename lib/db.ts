import { supabase, isSupabaseConfigured } from "./supabase";
import {
  Product,
  Property,
  DigitalBook,
  Course,
  Banner,
  Voucher,
  Category,
  Order,
  OrderItem,
  PropertyInquiry,
  Testimonial,
  SiteSettings,
  AdminShippingConfig,
} from "./types";
import {
  initialCategories,
  initialProducts,
  initialProperties,
  initialDigitalBooks,
  initialCourses,
  initialBanners,
  initialVouchers,
  initialTestimonials,
  initialSiteSettings,
} from "./mockData";

// LOCAL STORAGE PERSISTENCE HELPERS
const STORAGE_KEYS = {
  PRODUCTS: "kb_admin_products",
  PROPERTIES: "kb_admin_properties",
  BOOKS: "kb_admin_books",
  COURSES: "kb_admin_courses",
  ORDERS: "kb_admin_orders",
  INQUIRIES: "kb_admin_inquiries",
  CATEGORIES: "kb_admin_categories",
  VOUCHERS: "kb_admin_vouchers",
  BANNERS: "kb_admin_banners",
  SETTINGS: "kb_admin_site_settings_v2",
};

function getLocal<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

export function slugify(text?: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// ----------------------------------------------------
// 1. PUBLIC QUERIES (Zero-Overfetch Column Projections)
// ----------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  const local = getLocal<Category>(STORAGE_KEYS.CATEGORIES, []);
  if (local && local.length > 0) {
    return local.filter((c) => !["digital-books", "online-courses", "real-estate"].includes(c.slug));
  }

  if (!isSupabaseConfigured()) {
    return initialCategories;
  }
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url, parent_id, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return initialCategories;
    }
    return (data as Category[]).filter((c) => !["digital-books", "online-courses", "real-estate"].includes(c.slug));
  } catch {
    return initialCategories;
  }
}

export interface ProductFilterParams {
  categorySlug?: string;
  search?: string;
  flashSaleOnly?: boolean;
  featuredOnly?: boolean;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "best_match" | "top_sales" | "price_asc" | "price_desc" | "newest";
  limit?: number;
  offset?: number;
}

export function filterLocalProducts(list: Product[], params: ProductFilterParams = {}): { products: Product[]; total: number } {
  let filtered = [...list].filter((p) => p.is_active !== false);

  if (params.categorySlug) {
    const targetSlug = params.categorySlug.toLowerCase().trim();
    filtered = filtered.filter((p) => {
      if (p.category_slug && p.category_slug.toLowerCase().trim() === targetSlug) return true;
      if (p.category_name && slugify(p.category_name) === targetSlug) return true;
      if (p.category_id) {
        const cats = getLocal<Category>(STORAGE_KEYS.CATEGORIES, initialCategories);
        const matchedCat = cats.find((c) => c.id === p.category_id);
        if (matchedCat && matchedCat.slug.toLowerCase().trim() === targetSlug) return true;
      }
      return false;
    });
  }
  if (params.search) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand_name?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q)
    );
  }
  if (params.flashSaleOnly) {
    filtered = filtered.filter((p) => Boolean(p.is_flash_sale));
  }
  if (params.featuredOnly) {
    filtered = filtered.filter((p) => Boolean(p.is_featured));
  }
  if (params.province) {
    filtered = filtered.filter((p) => p.location_tag?.toLowerCase().includes(params.province!.toLowerCase()));
  }
  if (params.minPrice !== undefined && !isNaN(params.minPrice) && params.minPrice > 0) {
    filtered = filtered.filter((p) => (p.sale_price ?? p.price) >= params.minPrice!);
  }
  if (params.maxPrice !== undefined && !isNaN(params.maxPrice) && params.maxPrice > 0) {
    filtered = filtered.filter((p) => (p.sale_price ?? p.price) <= params.maxPrice!);
  }

  if (params.sort === "top_sales") {
    filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
  } else if (params.sort === "price_asc") {
    filtered.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
  } else if (params.sort === "price_desc") {
    filtered.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
  } else if (params.sort === "newest") {
    filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }

  const total = filtered.length;
  const offset = params.offset || 0;
  const limit = params.limit || 24;
  const paginated = filtered.slice(offset, offset + limit);

  return { products: paginated, total };
}

export async function getProducts(params: ProductFilterParams = {}): Promise<{ products: Product[]; total: number }> {
  const localList = getLocal<Product>(STORAGE_KEYS.PRODUCTS, initialProducts);

  if (!isSupabaseConfigured() || !supabase) {
    return filterLocalProducts(localList, params);
  }

  try {
    let query = supabase
      .from("products")
      .select("id, name, slug, price, sale_price, stock, rating, review_count, sales_count, thumbnail_url, category_name, category_slug, brand_name, is_flash_sale, is_featured, is_active, location_tag", { count: "exact" })
      .eq("is_active", true);

    if (params.categorySlug) query = query.eq("category_slug", params.categorySlug);
    if (params.flashSaleOnly) query = query.eq("is_flash_sale", true);
    if (params.featuredOnly) query = query.eq("is_featured", true);
    if (params.search) query = query.ilike("name", `%${params.search}%`);
    if (params.minPrice !== undefined && params.minPrice > 0) query = query.gte("price", params.minPrice);
    if (params.maxPrice !== undefined && params.maxPrice > 0) query = query.lte("price", params.maxPrice);

    if (params.sort === "price_asc") query = query.order("price", { ascending: true });
    else if (params.sort === "price_desc") query = query.order("price", { ascending: false });
    else if (params.sort === "top_sales") query = query.order("sales_count", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const limit = params.limit || 24;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error || !data) {
      return filterLocalProducts(localList, params);
    }
    return { products: data as Product[], total: count !== null ? count : data.length };
  } catch {
    return filterLocalProducts(localList, params);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const localList = getLocal<Product>(STORAGE_KEYS.PRODUCTS, initialProducts);
  const clean = slugify(slug);
  const localProduct = localList.find(
    (p) => p.slug === slug || slugify(p.slug) === clean || p.id === slug || slugify(p.name) === clean
  );

  if (!isSupabaseConfigured() || !supabase) {
    return localProduct || null;
  }
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, variants:product_variants(*), images:product_images(*)")
      .or(`slug.eq.${slug},slug.eq.${clean},id.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return localProduct || null;
    return data as Product;
  } catch {
    return localProduct || null;
  }
}

export interface PropertyFilterParams {
  propertyType?: string;
  type?: string;
  status?: string;
  minMarla?: number;
  maxMarla?: number;
  featuredOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getProperties(params: PropertyFilterParams = {}): Promise<{ properties: Property[]; total: number }> {
  const localList = getLocal<Property>(STORAGE_KEYS.PROPERTIES, initialProperties);
  const selectedType = params.propertyType || params.type;

  if (!isSupabaseConfigured() || !supabase) {
    let filtered = [...localList].filter((p) => p.is_active !== false);
    if (selectedType) filtered = filtered.filter((p) => p.property_type.toLowerCase() === selectedType.toLowerCase());
    if (params.minMarla) filtered = filtered.filter((p) => p.area_marla >= params.minMarla!);
    if (params.maxMarla) filtered = filtered.filter((p) => p.area_marla <= params.maxMarla!);
    if (params.featuredOnly) filtered = filtered.filter((p) => p.is_featured);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      );
    }
    return { properties: filtered.slice(0, params.limit || 12), total: filtered.length };
  }

  try {
    let query = supabase
      .from("properties")
      .select("id, title, slug, property_type, status, area_marla, price_pkr, price_display, location, bedrooms, bathrooms, kitchens, is_featured, thumbnail_url, features, is_active", { count: "exact" })
      .eq("is_active", true);

    if (selectedType) query = query.eq("property_type", selectedType);
    if (params.minMarla) query = query.gte("area_marla", params.minMarla);
    if (params.maxMarla) query = query.lte("area_marla", params.maxMarla);
    if (params.featuredOnly) query = query.eq("is_featured", true);
    if (params.search) query = query.ilike("title", `%${params.search}%`);

    query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });

    const limit = params.limit || 12;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error || !data || data.length === 0) {
      return { properties: localList.slice(0, params.limit || 12), total: localList.length };
    }
    return { properties: (data as unknown as Property[]), total: count || data.length };
  } catch {
    return { properties: localList.slice(0, params.limit || 12), total: localList.length };
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const localList = getLocal<Property>(STORAGE_KEYS.PROPERTIES, initialProperties);
  const clean = slugify(slug);
  const localProperty = localList.find(
    (p) => p.slug === slug || slugify(p.slug) === clean || p.id === slug || slugify(p.title) === clean
  );

  if (!isSupabaseConfigured() || !supabase) return localProperty || null;
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*, images:property_images(*)")
      .or(`slug.eq.${slug},slug.eq.${clean},id.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return localProperty || null;
    return data as Property;
  } catch {
    return localProperty || null;
  }
}

export async function getDigitalBooks(): Promise<DigitalBook[]> {
  const localList = getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, initialDigitalBooks);
  if (!isSupabaseConfigured() || !supabase) return localList;
  try {
    const { data, error } = await supabase.from("digital_books").select("*").eq("is_active", true);
    if (error || !data || data.length === 0) return localList;
    return data as DigitalBook[];
  } catch {
    return localList;
  }
}

export async function getDigitalBookBySlug(slug: string): Promise<DigitalBook | null> {
  const localList = getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, initialDigitalBooks);
  const clean = slugify(slug);
  return localList.find((b) => b.slug === slug || slugify(b.slug) === clean || b.id === slug || slugify(b.title) === clean) || null;
}

export async function getCourses(): Promise<Course[]> {
  const localList = getLocal<Course>(STORAGE_KEYS.COURSES, initialCourses);
  if (!isSupabaseConfigured() || !supabase) return localList;
  try {
    const { data, error } = await supabase.from("courses").select("*").eq("is_active", true);
    if (error || !data || data.length === 0) return localList;
    return data as Course[];
  } catch {
    return localList;
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const localList = getLocal<Course>(STORAGE_KEYS.COURSES, initialCourses);
  const clean = slugify(slug);
  return localList.find((c) => c.slug === slug || slugify(c.slug) === clean || c.id === slug || slugify(c.title) === clean) || null;
}

export async function getBanners(): Promise<Banner[]> {
  const localList = getLocal<Banner>(STORAGE_KEYS.BANNERS, initialBanners);
  if (!isSupabaseConfigured()) return localList;
  try {
    const { data, error } = await supabase.from("banners").select("*").eq("is_active", true).order("sort_order");
    if (error || !data || data.length === 0) return localList;
    return data as Banner[];
  } catch {
    return localList;
  }
}

export async function getVouchers(): Promise<Voucher[]> {
  const localList = getLocal<Voucher>(STORAGE_KEYS.VOUCHERS, initialVouchers);
  if (!isSupabaseConfigured()) return localList;
  try {
    const { data, error } = await supabase.from("vouchers").select("*").eq("is_active", true);
    if (error || !data || data.length === 0) return localList;
    return data as Voucher[];
  } catch {
    return localList;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return initialTestimonials;
}

// ----------------------------------------------------
// 2. ORDER CREATION (Guest Checkout, Zero Auth)
// ----------------------------------------------------

export async function createOrder(
  orderData: Omit<Order, "id" | "order_number" | "tracking_token" | "created_at" | "items">,
  items: Omit<OrderItem, "id" | "order_id">[]
): Promise<{ success: boolean; orderNumber?: string; trackingToken?: string; error?: string }> {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `KH-${randomSuffix}`;
  const trackingToken = Math.random().toString(36).substring(2, 10).toUpperCase();

  const newOrder: Order = {
    ...orderData,
    id: `ord_${Date.now()}`,
    order_number: orderNumber,
    tracking_token: trackingToken,
    created_at: new Date().toISOString(),
    items: items.map((it, idx) => ({ ...it, id: `item_${Date.now()}_${idx}`, order_id: `ord_${Date.now()}` })),
  };

  const existingOrders = getLocal<Order>(STORAGE_KEYS.ORDERS, []);
  setLocal(STORAGE_KEYS.ORDERS, [newOrder, ...existingOrders]);

  if (isSupabaseConfigured()) {
    try {
      const { data: insertedOrder, error: orderError } = await supabase
        .from("orders")
        .insert([{ ...orderData, order_number: orderNumber, tracking_token: trackingToken }])
        .select("id")
        .single();

      if (!orderError && insertedOrder) {
        const orderItemsPayload = items.map((it) => ({ ...it, order_id: insertedOrder.id }));
        await supabase.from("order_items").insert(orderItemsPayload);
      }
    } catch (err) {
      console.warn("Supabase order sync bypassed (saved locally):", err);
    }
  }

  return { success: true, orderNumber, trackingToken };
}

export async function getOrderByTracking(query: string): Promise<Order | null> {
  const localOrders = getLocal<Order>(STORAGE_KEYS.ORDERS, []);
  const cleanQ = query.trim().toUpperCase();
  const foundLocal = localOrders.find(
    (o) => o.order_number.toUpperCase() === cleanQ || o.tracking_token.toUpperCase() === cleanQ || o.customer_phone.includes(cleanQ)
  );

  if (!isSupabaseConfigured()) return foundLocal || null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .or(`order_number.eq.${cleanQ},tracking_token.eq.${cleanQ},customer_phone.ilike.%${cleanQ}%`)
      .limit(1)
      .single();

    if (error || !data) return foundLocal || null;
    return data as Order;
  } catch {
    return foundLocal || null;
  }
}

export async function createPropertyInquiry(inquiry: Partial<PropertyInquiry> & { customer_name: string; customer_phone: string }): Promise<{ success: boolean; error?: string }> {
  const newInq: PropertyInquiry = {
    id: inquiry.id || `inq_${Date.now()}`,
    customer_name: inquiry.customer_name,
    customer_phone: inquiry.customer_phone,
    property_id: inquiry.property_id,
    property_title: inquiry.property_title,
    message: inquiry.message,
    preferred_visit_date: inquiry.preferred_visit_date,
    status: inquiry.status || "New",
    created_at: new Date().toISOString(),
  };
  const existingInquiries = getLocal<PropertyInquiry>(STORAGE_KEYS.INQUIRIES, []);
  setLocal(STORAGE_KEYS.INQUIRIES, [newInq, ...existingInquiries]);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("property_inquiries").insert([inquiry]);
    } catch {}
  }
  return { success: true };
}

// ----------------------------------------------------
// 3. ADMIN CRUD OPERATIONS & DATA MANAGEMENT
// ----------------------------------------------------

export async function getAdminOverview() {
  const orders = await adminGetOrders();

  const products = getLocal<Product>(STORAGE_KEYS.PRODUCTS, initialProducts);
  const properties = getLocal<Property>(STORAGE_KEYS.PROPERTIES, initialProperties);
  const books = getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, initialDigitalBooks);
  const courses = getLocal<Course>(STORAGE_KEYS.COURSES, initialCourses);
  const inquiries = getLocal<PropertyInquiry>(STORAGE_KEYS.INQUIRIES, [
    {
      id: "inq_1",
      property_id: "prop_1",
      property_title: "4 Marla 1.5 Story Brand New House in Shahpur",
      customer_name: "Chaudhry Bilal",
      customer_phone: "0335 1234567",
      preferred_visit_date: "2026-08-25",
      message: "Want to inspect sweet water boring and street width.",
      status: "New",
      created_at: new Date().toISOString(),
    },
  ]);

  const totalSales = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.order_status === "Pending").length;
  const lowStock = products.filter((p) => p.stock < 10).length;

  return {
    totalSales,
    totalOrders: orders.length,
    pendingOrders,
    activeProducts: products.length,
    activeProperties: properties.length,
    activeBooks: books.length,
    activeCourses: courses.length,
    totalInquiries: inquiries.length,
    lowStockAlerts: lowStock,
    recentOrders: orders.slice(0, 8),
    recentInquiries: inquiries.slice(0, 5),
  };
}

// PRODUCT CRUD
export async function adminSaveProduct(product: Partial<Product>): Promise<Product> {
  const current = getLocal<Product>(STORAGE_KEYS.PRODUCTS, initialProducts);
  let updatedProduct: Product;
  const derivedSlug = slugify(product.slug || product.name || `product-${Date.now()}`);

  if (product.id && current.some((p) => p.id === product.id)) {
    updatedProduct = {
      ...current.find((p) => p.id === product.id)!,
      ...product,
      slug: derivedSlug,
    } as Product;
    const updated = current.map((p) => (p.id === product.id ? updatedProduct : p));
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
  } else {
    updatedProduct = {
      id: product.id || `prod_${Date.now()}`,
      name: product.name || "Untitled Product",
      description: product.description || product.short_description || "",
      short_description: product.short_description || "",
      price: product.price || 999,
      sale_price: product.sale_price,
      stock: product.stock ?? 20,
      rating: product.rating ?? 5.0,
      review_count: product.review_count ?? 1,
      sales_count: product.sales_count ?? 0,
      thumbnail_url: product.thumbnail_url || "/assets/cloth-stand-1.jpeg",
      category_name: product.category_name || "General",
      category_slug: product.category_slug || "general",
      brand_name: product.brand_name || "Karobaari Hub",
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      is_flash_sale: product.is_flash_sale ?? false,
      created_at: new Date().toISOString(),
      variants: product.variants || [],
      images: product.images || [],
      ...product,
      slug: derivedSlug,
    } as Product;
    setLocal(STORAGE_KEYS.PRODUCTS, [updatedProduct, ...current]);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { id, variants, images, ...payload } = updatedProduct;
      await supabase.from("products").upsert({ id: updatedProduct.id, ...payload });
    } catch {}
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kb_products_updated"));
  }

  return updatedProduct;
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  const current = getLocal<Product>(STORAGE_KEYS.PRODUCTS, initialProducts);
  const updated = current.filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("products").delete().eq("id", id);
    } catch {}
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kb_products_updated"));
  }

  return true;
}

// PROPERTY CRUD
export async function adminSaveProperty(property: Partial<Property>): Promise<Property> {
  const current = getLocal<Property>(STORAGE_KEYS.PROPERTIES, initialProperties);
  let updatedProperty: Property;
  const derivedSlug = slugify(property.slug || property.title || `property-${Date.now()}`);

  if (property.id && current.some((p) => p.id === property.id)) {
    updatedProperty = {
      ...current.find((p) => p.id === property.id)!,
      ...property,
      slug: derivedSlug,
    } as Property;
    const updated = current.map((p) => (p.id === property.id ? updatedProperty : p));
    setLocal(STORAGE_KEYS.PROPERTIES, updated);
  } else {
    updatedProperty = {
      id: property.id || `prop_${Date.now()}`,
      title: property.title || "New Property Listing",
      property_type: property.property_type || "House",
      status: property.status || "For Sale",
      area_marla: property.area_marla ?? 5,
      price: property.price ?? 10000000,
      price_display: property.price_display || "Rs. 1 Crore",
      location: property.location || "Shahpur, Rawalpindi",
      bedrooms: property.bedrooms ?? 3,
      bathrooms: property.bathrooms ?? 3,
      kitchens: property.kitchens ?? 2,
      description: property.description || "Luxury property for sale in Rawalpindi / Islamabad",
      is_featured: property.is_featured ?? true,
      thumbnail_url: property.thumbnail_url || "/assets/shahpur-house.jpeg",
      features: property.features || ["Direct Registry", "Sweet Water", "Electricity"],
      is_active: property.is_active ?? true,
      created_at: new Date().toISOString(),
      ...property,
      slug: derivedSlug,
    } as Property;
    setLocal(STORAGE_KEYS.PROPERTIES, [updatedProperty, ...current]);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { id, images, ...payload } = updatedProperty;
      await supabase.from("properties").upsert({ id: updatedProperty.id, ...payload });
    } catch {}
  }
  return updatedProperty;
}

export async function adminDeleteProperty(id: string): Promise<boolean> {
  const current = getLocal<Property>(STORAGE_KEYS.PROPERTIES, initialProperties);
  const updated = current.filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.PROPERTIES, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("properties").delete().eq("id", id);
    } catch {}
  }
  return true;
}

// E-BOOKS CRUD
export async function adminSaveDigitalBook(book: Partial<DigitalBook>): Promise<DigitalBook> {
  const current = getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, initialDigitalBooks);
  let updatedBook: DigitalBook;
  const derivedSlug = slugify(book.slug || book.title || `book-${Date.now()}`);

  if (book.id && current.some((b) => b.id === book.id)) {
    updatedBook = {
      ...current.find((b) => b.id === book.id)!,
      ...book,
      slug: derivedSlug,
    } as DigitalBook;
    const updated = current.map((b) => (b.id === book.id ? updatedBook : b));
    setLocal(STORAGE_KEYS.BOOKS, updated);
  } else {
    updatedBook = {
      id: book.id || `book_${Date.now()}`,
      title: book.title || "Untitled Blueprint",
      author: book.author || "Karobaari Hub Academy",
      category: book.category || "Business",
      price: book.price ?? 499,
      sale_price: book.sale_price,
      cover_url: book.cover_url || "/assets/ebook-cover.jpeg",
      file_format: book.file_format || "PDF",
      pages_count: book.pages_count ?? 85,
      file_size_mb: book.file_size_mb ?? 12.5,
      is_active: book.is_active ?? true,
      created_at: new Date().toISOString(),
      ...book,
      slug: derivedSlug,
    } as DigitalBook;
    setLocal(STORAGE_KEYS.BOOKS, [updatedBook, ...current]);
  }
  return updatedBook;
}

export async function adminDeleteDigitalBook(id: string): Promise<boolean> {
  const current = getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, initialDigitalBooks);
  setLocal(STORAGE_KEYS.BOOKS, current.filter((b) => b.id !== id));
  return true;
}

// COURSES CRUD
export async function adminSaveCourse(course: Partial<Course>): Promise<Course> {
  const current = getLocal<Course>(STORAGE_KEYS.COURSES, initialCourses);
  let updatedCourse: Course;
  const derivedSlug = slugify(course.slug || course.title || `course-${Date.now()}`);

  if (course.id && current.some((c) => c.id === course.id)) {
    updatedCourse = {
      ...current.find((c) => c.id === course.id)!,
      ...course,
      slug: derivedSlug,
    } as Course;
    const updated = current.map((c) => (c.id === course.id ? updatedCourse : c));
    setLocal(STORAGE_KEYS.COURSES, updated);
  } else {
    updatedCourse = {
      id: course.id || `course_${Date.now()}`,
      title: course.title || "New Mastery Course",
      instructor: course.instructor || "Prism Business Hub",
      duration: course.duration || "10 Hours",
      modules_count: course.modules_count ?? 6,
      lessons_count: course.lessons_count ?? 24,
      price: course.price ?? 4999,
      sale_price: course.sale_price,
      thumbnail_url: course.thumbnail_url || "/assets/course-thumb.jpeg",
      level: course.level || "All Levels",
      is_active: course.is_active ?? true,
      created_at: new Date().toISOString(),
      curriculum: course.curriculum || [],
      ...course,
      slug: derivedSlug,
    } as Course;
    setLocal(STORAGE_KEYS.COURSES, [updatedCourse, ...current]);
  }
  return updatedCourse;
}

export async function adminDeleteCourse(id: string): Promise<boolean> {
  const current = getLocal<Course>(STORAGE_KEYS.COURSES, initialCourses);
  setLocal(STORAGE_KEYS.COURSES, current.filter((c) => c.id !== id));
  return true;
}

// CATEGORIES CRUD
export async function adminSaveCategory(category: Partial<Category>): Promise<Category> {
  const local = getLocal<Category>(STORAGE_KEYS.CATEGORIES, []);
  const current = local.length > 0 ? local : initialCategories;
  let updatedCat: Category;
  const derivedSlug = slugify(category.slug || category.name || `cat-${Date.now()}`);

  if (category.id && current.some((c) => c.id === category.id)) {
    updatedCat = {
      ...current.find((c) => c.id === category.id)!,
      ...category,
      slug: derivedSlug,
    } as Category;
    const updated = current.map((c) => (c.id === category.id ? updatedCat : c));
    setLocal(STORAGE_KEYS.CATEGORIES, updated);
  } else {
    updatedCat = {
      id: category.id || `cat_${Date.now()}`,
      name: category.name || "New Category",
      image_url: category.image_url || "/assets/cloth-stand-1.jpeg",
      sort_order: category.sort_order ?? (current.length + 1),
      is_active: category.is_active ?? true,
      ...category,
      slug: derivedSlug,
    } as Category;
    setLocal(STORAGE_KEYS.CATEGORIES, [...current, updatedCat]);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("categories").upsert(updatedCat);
    } catch {}
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kb_categories_updated"));
  }
  return updatedCat;
}

export async function adminDeleteCategory(id: string): Promise<boolean> {
  const local = getLocal<Category>(STORAGE_KEYS.CATEGORIES, []);
  const current = local.length > 0 ? local : initialCategories;
  const updated = current.filter((c) => c.id !== id);
  setLocal(STORAGE_KEYS.CATEGORIES, updated);
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("categories").delete().eq("id", id);
    } catch {}
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kb_categories_updated"));
  }
  return true;
}

// VOUCHERS CRUD
export async function adminSaveVoucher(voucher: Partial<Voucher>): Promise<Voucher> {
  const current = getLocal<Voucher>(STORAGE_KEYS.VOUCHERS, initialVouchers);
  let updatedV: Voucher;

  if (voucher.id && current.some((v) => v.id === voucher.id)) {
    updatedV = { ...current.find((v) => v.id === voucher.id)!, ...voucher } as Voucher;
    const updated = current.map((v) => (v.id === voucher.id ? updatedV : v));
    setLocal(STORAGE_KEYS.VOUCHERS, updated);
  } else {
    updatedV = {
      id: voucher.id || `vouch_${Date.now()}`,
      code: voucher.code?.toUpperCase() || "PROMO2026",
      title: voucher.title || "Special Discount",
      discount_type: voucher.discount_type || "fixed",
      discount_value: voucher.discount_value ?? 500,
      min_spend: voucher.min_spend ?? 1000,
      is_free_shipping: voucher.is_free_shipping ?? false,
      is_active: voucher.is_active ?? true,
      created_at: new Date().toISOString(),
      ...voucher,
    } as Voucher;
    setLocal(STORAGE_KEYS.VOUCHERS, [updatedV, ...current]);
  }
  return updatedV;
}

export async function adminDeleteVoucher(id: string): Promise<boolean> {
  const current = getLocal<Voucher>(STORAGE_KEYS.VOUCHERS, initialVouchers);
  setLocal(STORAGE_KEYS.VOUCHERS, current.filter((v) => v.id !== id));
  return true;
}

// BANNERS CRUD
export async function adminSaveBanner(banner: Partial<Banner>): Promise<Banner> {
  const current = getLocal<Banner>(STORAGE_KEYS.BANNERS, initialBanners);
  let updatedB: Banner;

  if (banner.id && current.some((b) => b.id === banner.id)) {
    updatedB = { ...current.find((b) => b.id === banner.id)!, ...banner } as Banner;
    const updated = current.map((b) => (b.id === banner.id ? updatedB : b));
    setLocal(STORAGE_KEYS.BANNERS, updated);
  } else {
    updatedB = {
      id: banner.id || `banner_${Date.now()}`,
      title: banner.title || "Featured Promotion",
      subtitle: banner.subtitle || "Smart Shopping in Pakistan",
      image_url: banner.image_url || "/assets/ecommerce-banner-1.jpeg",
      link_url: banner.link_url || "/shop",
      cta_text: banner.cta_text || "Shop Deals",
      sort_order: banner.sort_order ?? 1,
      is_active: banner.is_active ?? true,
      ...banner,
    } as Banner;
    setLocal(STORAGE_KEYS.BANNERS, [updatedB, ...current]);
  }
  return updatedB;
}

export async function adminDeleteBanner(id: string): Promise<boolean> {
  const current = getLocal<Banner>(STORAGE_KEYS.BANNERS, initialBanners);
  setLocal(STORAGE_KEYS.BANNERS, current.filter((b) => b.id !== id));
  return true;
}

// ORDERS MANAGEMENT
export const DEFAULT_SHIPPING_CONFIG: AdminShippingConfig = {
  store_name: "Karobaari Hub & Prism Real Estate",
  phone: "+92 335 9939702",
  email: "prismrealestate4@gmail.com",
  dispatch_address: "Main Stop Shahpur, Adyala Road",
  city: "Rawalpindi / Islamabad",
  province: "Punjab",
  ntn_number: "PK-NTN-893241-7",
  invoice_footer_note: "Thank you for shopping with Karobaari Hub! For order tracking or support, contact us on WhatsApp.",
  return_policy_note: "7-Day Easy Return Policy applicable for damaged or incorrect goods upon delivery inspection.",
};

export async function adminGetShippingConfig(): Promise<AdminShippingConfig> {
  if (typeof window === "undefined") return DEFAULT_SHIPPING_CONFIG;
  try {
    const saved = localStorage.getItem("kb_admin_shipping_config");
    if (!saved) return DEFAULT_SHIPPING_CONFIG;
    return { ...DEFAULT_SHIPPING_CONFIG, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_SHIPPING_CONFIG;
  }
}

export async function adminSaveShippingConfig(config: AdminShippingConfig): Promise<AdminShippingConfig> {
  if (typeof window !== "undefined") {
    localStorage.setItem("kb_admin_shipping_config", JSON.stringify(config));
  }
  return config;
}

export async function adminGetOrders(): Promise<Order[]> {
  const local = getLocal<Order>(STORAGE_KEYS.ORDERS, []);
  if (!isSupabaseConfigured() || !supabase) {
    return local;
  }
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Order[];
    }
    return local;
  } catch {
    return local;
  }
}

export async function adminSaveOrder(order: Partial<Order>): Promise<Order> {
  const current = getLocal<Order>(STORAGE_KEYS.ORDERS, []);
  let updatedOrder: Order;

  if (order.id && current.some((o) => o.id === order.id)) {
    updatedOrder = { ...current.find((o) => o.id === order.id)!, ...order } as Order;
    const updated = current.map((o) => (o.id === order.id ? updatedOrder : o));
    setLocal(STORAGE_KEYS.ORDERS, updated);
  } else {
    updatedOrder = {
      id: order.id || `order_${Date.now()}`,
      order_number: order.order_number || `KH-${Math.floor(100000 + Math.random() * 900000)}`,
      customer_name: order.customer_name || "Customer",
      customer_phone: order.customer_phone || "",
      province: order.province || "Punjab",
      city: order.city || "Rawalpindi",
      delivery_address: order.delivery_address || "",
      address_label: order.address_label || "Home",
      subtotal: order.subtotal || 0,
      discount_amount: order.discount_amount || 0,
      shipping_fee: order.shipping_fee ?? 199,
      total_amount: order.total_amount || 0,
      payment_method: order.payment_method || "COD",
      payment_status: order.payment_status || "Pending",
      order_status: order.order_status || "Pending",
      tracking_token: order.tracking_token || `TRK-${Date.now().toString(36).toUpperCase()}`,
      items: order.items || [],
      created_at: new Date().toISOString(),
      ...order,
    } as Order;
    setLocal(STORAGE_KEYS.ORDERS, [updatedOrder, ...current]);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("orders").upsert(updatedOrder);
    } catch {}
  }
  return updatedOrder;
}

export async function adminDeleteOrder(orderId: string): Promise<boolean> {
  const current = getLocal<Order>(STORAGE_KEYS.ORDERS, []);
  setLocal(STORAGE_KEYS.ORDERS, current.filter((o) => o.id !== orderId));
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("orders").delete().eq("id", orderId);
    } catch {}
  }
  return true;
}

export async function adminUpdateOrderStatus(orderId: string, status: Order["order_status"]): Promise<boolean> {
  const current = getLocal<Order>(STORAGE_KEYS.ORDERS, []);
  const updated = current.map((o) => (o.id === orderId ? { ...o, order_status: status } : o));
  setLocal(STORAGE_KEYS.ORDERS, updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("orders").update({ order_status: status }).eq("id", orderId);
    } catch {}
  }
  return true;
}

// INQUIRIES MANAGEMENT
export async function adminGetInquiries(): Promise<PropertyInquiry[]> {
  return getLocal<PropertyInquiry>(STORAGE_KEYS.INQUIRIES, []);
}

export async function adminUpdateInquiryStatus(inquiryId: string, status: PropertyInquiry["status"]): Promise<boolean> {
  const current = getLocal<PropertyInquiry>(STORAGE_KEYS.INQUIRIES, []);
  const updated = current.map((i) => (i.id === inquiryId ? { ...i, status } : i));
  setLocal(STORAGE_KEYS.INQUIRIES, updated);
  return true;
}

export async function adminDeleteInquiry(inquiryId: string): Promise<boolean> {
  const current = getLocal<PropertyInquiry>(STORAGE_KEYS.INQUIRIES, []);
  setLocal(STORAGE_KEYS.INQUIRIES, current.filter((i) => i.id !== inquiryId));
  return true;
}

// IMAGE UPLOADER HELPER (Client File to URL / Supabase Storage)
export async function uploadImageFile(file: File, folder = "products"): Promise<string> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error } = await supabase.storage.from("karobaari-assets").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from("karobaari-assets").getPublicUrl(data.path);
        if (publicUrlData?.publicUrl) return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn("Direct storage upload fallback to ObjectURL:", err);
    }
  }

  // Fallback: Read file as Data URL for instant client preview and offline persistence
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve((e.target?.result as string) || URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  });
}

// SITE SETTINGS MANAGEMENT
export async function getSiteSettings(): Promise<SiteSettings> {
  if (typeof window === "undefined") return initialSiteSettings;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!saved) return initialSiteSettings;
    return { ...initialSiteSettings, ...JSON.parse(saved) };
  } catch {
    return initialSiteSettings;
  }
}

export async function adminSaveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event("kb_settings_updated"));
  }
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("site_settings").upsert({ id: "main", ...settings });
    } catch {}
  }
  return settings;
}

// SUPABASE CONNECTION TEST
export async function testSupabaseConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { connected: false, error: "Missing Supabase Environment Credentials (using local persistence)" };
  }
  try {
    const start = performance.now();
    const { error } = await supabase.from("categories").select("id").limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      return { connected: false, latencyMs, error: error.message };
    }
    return { connected: true, latencyMs };
  } catch (err: any) {
    return { connected: false, error: err.message || "Failed to reach Supabase" };
  }
}