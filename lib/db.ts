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

// AUTO-PURGE LEGACY MOCK DATA FROM BROWSER STORAGE ON LOAD
if (typeof window !== "undefined") {
  try {
    const cleaned = sessionStorage.getItem("kb_cleanup_v3");
    if (!cleaned) {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
      localStorage.removeItem(STORAGE_KEYS.BOOKS);
      localStorage.removeItem(STORAGE_KEYS.COURSES);
      localStorage.removeItem(STORAGE_KEYS.BANNERS);
      localStorage.removeItem(STORAGE_KEYS.VOUCHERS);
      sessionStorage.setItem("kb_cleanup_v3", "true");
    }
  } catch {}
}

function getLocal<T>(key: string, fallback: T[] = []): T[] {
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

export function cleanPropertySlug(text?: string): string {
  if (!text) return "";
  let clean = text.replace(/https?:\/\/[^\s]+/gi, "").replace(/www\.[^\s]+/gi, "");
  clean = clean.replace(/^(https?|youtube|youtu\.?be)[\w\-]*/gi, "");
  const primary = clean.split("|")[0].trim();
  clean = primary || clean;
  return slugify(clean);
}

export function isValidUUID(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ----------------------------------------------------
// 1. PUBLIC QUERIES (Zero-Overfetch Column Projections)
// ----------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        return (data as Category[]).filter((c) => !["digital-books", "online-courses", "real-estate"].includes(c.slug));
      }
    } catch {}
    return [];
  }

  const local = getLocal<Category>(STORAGE_KEYS.CATEGORIES, []);
  return (local || []).filter((c) => !["digital-books", "online-courses", "real-estate"].includes(c.slug));
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
    const allCats = getLocal<Category>(STORAGE_KEYS.CATEGORIES, []);
    const matchingSlugs = getCategoryDescendantSlugs(params.categorySlug, allCats).map((s) => s.toLowerCase().trim());
    filtered = filtered.filter((p) => {
      const pSlug = (p.category_slug || "").toLowerCase().trim();
      const pNameSlug = slugify(p.category_name || "");
      return matchingSlugs.includes(pSlug) || matchingSlugs.includes(pNameSlug);
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
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_active", true);

      if (params.categorySlug) {
        const allCats = await getCategories();
        const matchingSlugs = getCategoryDescendantSlugs(params.categorySlug, allCats);
        if (matchingSlugs.length === 1) {
          query = query.eq("category_slug", matchingSlugs[0]);
        } else if (matchingSlugs.length > 1) {
          query = query.in("category_slug", matchingSlugs);
        }
      }
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
      if (!error && data) {
        return { products: data as Product[], total: count !== null ? count : data.length };
      }
    } catch {}
    return { products: [], total: 0 };
  }

  const localList = getLocal<Product>(STORAGE_KEYS.PRODUCTS, []);
  return filterLocalProducts(localList, params);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const clean = slugify(slug);

  if (isSupabaseConfigured() && supabase) {
    try {
      const filters = [`slug.eq.${slug}`];
      if (clean && clean !== slug) filters.push(`slug.eq.${clean}`);
      if (isValidUUID(slug)) filters.push(`id.eq.${slug}`);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(filters.join(","))
        .limit(1)
        .maybeSingle();

      if (!error && data) return data as Product;
    } catch {}
    return null;
  }

  const localList = getLocal<Product>(STORAGE_KEYS.PRODUCTS, []);
  const localProduct = localList.find(
    (p) => p.slug === slug || slugify(p.slug) === clean || p.id === slug || slugify(p.name) === clean
  );
  return localProduct || null;
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
  const selectedType = params.propertyType || params.type;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from("properties")
        .select("*", { count: "exact" })
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
      if (!error && data) {
        return { properties: (data as unknown as Property[]), total: count || data.length };
      }
    } catch {}
    return { properties: [], total: 0 };
  }

  const localList = getLocal<Property>(STORAGE_KEYS.PROPERTIES, []);
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

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const clean = slugify(slug);

  if (isSupabaseConfigured() && supabase) {
    try {
      const filters = [`slug.eq.${slug}`];
      if (clean && clean !== slug) filters.push(`slug.eq.${clean}`);
      if (isValidUUID(slug)) filters.push(`id.eq.${slug}`);

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .or(filters.join(","))
        .limit(1)
        .maybeSingle();

      if (!error && data) return data as Property;
    } catch {}
    return null;
  }

  const localList = getLocal<Property>(STORAGE_KEYS.PROPERTIES, []);
  const localProperty = localList.find(
    (p) => p.slug === slug || slugify(p.slug) === clean || p.id === slug || slugify(p.title) === clean
  );
  return localProperty || null;
}

export async function getDigitalBooks(): Promise<DigitalBook[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("digital_books").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (!error && data) {
        return data as DigitalBook[];
      }
    } catch {}
    return [];
  }
  return getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, []);
}

export async function getDigitalBookBySlug(slug: string): Promise<DigitalBook | null> {
  const clean = slugify(slug);
  if (isSupabaseConfigured() && supabase) {
    try {
      const filters = [`slug.eq.${slug}`];
      if (clean && clean !== slug) filters.push(`slug.eq.${clean}`);
      if (isValidUUID(slug)) filters.push(`id.eq.${slug}`);

      const { data, error } = await supabase
        .from("digital_books")
        .select("*")
        .or(filters.join(","))
        .limit(1)
        .maybeSingle();

      if (!error && data) return data as DigitalBook;
    } catch {}
    return null;
  }
  const localList = getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, []);
  return localList.find((b) => b.slug === slug || slugify(b.slug) === clean || b.id === slug || slugify(b.title) === clean) || null;
}

export async function getCourses(): Promise<Course[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("courses").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (!error && data) {
        return data as Course[];
      }
    } catch {}
    return [];
  }
  return getLocal<Course>(STORAGE_KEYS.COURSES, []);
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const clean = slugify(slug);
  if (isSupabaseConfigured() && supabase) {
    try {
      const filters = [`slug.eq.${slug}`];
      if (clean && clean !== slug) filters.push(`slug.eq.${clean}`);
      if (isValidUUID(slug)) filters.push(`id.eq.${slug}`);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .or(filters.join(","))
        .limit(1)
        .maybeSingle();

      if (!error && data) return data as Course;
    } catch {}
    return null;
  }
  const localList = getLocal<Course>(STORAGE_KEYS.COURSES, []);
  return localList.find((c) => c.slug === slug || slugify(c.slug) === clean || c.id === slug || slugify(c.title) === clean) || null;
}

export async function getBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("banners").select("*").eq("is_active", true).order("sort_order", { ascending: true });
      if (!error && data) {
        return data as Banner[];
      }
    } catch {}
    return [];
  }
  return getLocal<Banner>(STORAGE_KEYS.BANNERS, []);
}

export async function getVouchers(): Promise<Voucher[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("vouchers").select("*").eq("is_active", true);
      if (!error && data) {
        return data as Voucher[];
      }
    } catch {}
    return [];
  }
  return getLocal<Voucher>(STORAGE_KEYS.VOUCHERS, []);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("testimonials").select("*").eq("is_active", true);
      if (!error && data && data.length > 0) {
        return data as Testimonial[];
      }
    } catch {}
  }
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

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: insertedOrder, error: orderError } = await supabase
        .from("orders")
        .insert([{ ...orderData, order_number: orderNumber, tracking_token: trackingToken }])
        .select("id")
        .single();

      if (!orderError && insertedOrder) {
        const orderItemsPayload = items.map((it) => ({
          order_id: insertedOrder.id,
          product_id: it.product_id && isValidUUID(it.product_id) ? it.product_id : null,
          product_name_snapshot: it.product_name_snapshot,
          sku_snapshot: it.sku_snapshot || null,
          variant_snapshot: it.variant_snapshot || null,
          unit_price: it.unit_price,
          quantity: it.quantity,
          line_total: it.line_total,
        }));
        const { error: itemsErr } = await supabase.from("order_items").insert(orderItemsPayload);
        if (itemsErr) {
          console.warn("Retrying order_items insert with safe product_id: null due to:", itemsErr.message);
          const safeFallback = orderItemsPayload.map((it) => ({ ...it, product_id: null }));
          await supabase.from("order_items").insert(safeFallback);
        }
      }
    } catch (err) {
      console.warn("Supabase order sync error:", err);
    }
  }

  return { success: true, orderNumber, trackingToken };
}

export async function getOrderByTracking(query: string): Promise<Order | null> {
  const cleanQ = query.trim().toUpperCase();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .or(`order_number.eq.${cleanQ},tracking_token.eq.${cleanQ},customer_phone.ilike.%${cleanQ}%`)
        .limit(1)
        .single();

      if (!error && data) return data as Order;
    } catch {}
  }

  const localOrders = getLocal<Order>(STORAGE_KEYS.ORDERS, []);
  const foundLocal = localOrders.find(
    (o) => o.order_number.toUpperCase() === cleanQ || o.tracking_token.toUpperCase() === cleanQ || o.customer_phone.includes(cleanQ)
  );
  return foundLocal || null;
}

export async function createPropertyInquiry(inquiry: Partial<PropertyInquiry> & { customer_name: string; customer_phone: string }): Promise<{ success: boolean; error?: string }> {
  const newInq: PropertyInquiry = {
    id: inquiry.id || `inq_${Date.now()}`,
    customer_name: inquiry.customer_name,
    customer_phone: inquiry.customer_phone,
    property_id: inquiry.property_id && isValidUUID(inquiry.property_id) ? inquiry.property_id : undefined,
    property_title: inquiry.property_title || "General Customer Support / Contact Message",
    message: inquiry.message,
    preferred_visit_date: inquiry.preferred_visit_date,
    status: inquiry.status || "New",
    created_at: new Date().toISOString(),
  };
  const existingInquiries = getLocal<PropertyInquiry>(STORAGE_KEYS.INQUIRIES, []);
  setLocal(STORAGE_KEYS.INQUIRIES, [newInq, ...existingInquiries]);

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = {
        customer_name: inquiry.customer_name,
        customer_phone: inquiry.customer_phone,
        property_title: inquiry.property_title || "General Customer Support / Contact Message",
        message: inquiry.message || "",
        status: inquiry.status || "New",
      };
      if (inquiry.property_id && isValidUUID(inquiry.property_id)) {
        payload.property_id = inquiry.property_id;
      }
      if (inquiry.preferred_visit_date) {
        payload.preferred_visit_date = inquiry.preferred_visit_date;
      }
      const { data, error } = await supabase.from("property_inquiries").insert([payload]).select("id").single();
      if (!error && data?.id) {
        newInq.id = data.id;
      }
    } catch (err) {
      console.error("Create inquiry error:", err);
    }
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kb_inquiries_updated"));
  }
  return { success: true };
}

// ----------------------------------------------------
// 3. ADMIN CRUD OPERATIONS & DATA MANAGEMENT
// ----------------------------------------------------

export async function getAdminOverview() {
  const orders = await adminGetOrders();
  const inquiries = await adminGetInquiries();

  let productsCount = 0;
  let propertiesCount = 0;
  let booksCount = 0;
  let coursesCount = 0;
  let inquiriesCount = inquiries.length;
  let lowStock = 0;

  if (isSupabaseConfigured() && supabase) {
    try {
      const [pRes, propRes, bRes, cRes] = await Promise.all([
        supabase.from("products").select("id, stock", { count: "exact" }),
        supabase.from("properties").select("id", { count: "exact" }),
        supabase.from("digital_books").select("id", { count: "exact" }),
        supabase.from("courses").select("id", { count: "exact" }),
      ]);

      productsCount = pRes.count ?? pRes.data?.length ?? 0;
      propertiesCount = propRes.count ?? propRes.data?.length ?? 0;
      booksCount = bRes.count ?? bRes.data?.length ?? 0;
      coursesCount = cRes.count ?? cRes.data?.length ?? 0;
      if (pRes.data) {
        lowStock = pRes.data.filter((p: any) => (p.stock || 0) < 10).length;
      }
    } catch {}
  }

  if (!isSupabaseConfigured() && productsCount === 0) {
    const products = getLocal<Product>(STORAGE_KEYS.PRODUCTS, []);
    productsCount = products.length;
    lowStock = products.filter((p) => (p.stock || 0) < 10).length;
    propertiesCount = getLocal<Property>(STORAGE_KEYS.PROPERTIES, []).length;
    booksCount = getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, []).length;
    coursesCount = getLocal<Course>(STORAGE_KEYS.COURSES, []).length;
  }

  const totalSales = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.order_status === "Pending").length;

  return {
    totalSales,
    totalOrders: orders.length,
    pendingOrders,
    activeProducts: productsCount,
    activeProperties: propertiesCount,
    activeBooks: booksCount,
    activeCourses: coursesCount,
    totalInquiries: inquiriesCount,
    lowStockAlerts: lowStock,
    recentOrders: orders.slice(0, 8),
    recentInquiries: inquiries.slice(0, 5),
  };
}

// PRODUCT CRUD
export async function adminSaveProduct(product: Partial<Product>): Promise<Product> {
  const current = getLocal<Product>(STORAGE_KEYS.PRODUCTS, []);
  let updatedProduct: Product;
  const derivedSlug = slugify(product.slug || product.name || `product-${Date.now()}`);

  if (product.id && current.some((p) => p.id === product.id)) {
    updatedProduct = {
      ...current.find((p) => p.id === product.id)!,
      ...product,
      slug: derivedSlug,
    } as Product;
  } else {
    updatedProduct = {
      id: isValidUUID(product.id) ? product.id! : generateUUID(),
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
  }

  // Clean variants before saving
  const cleanedVariants = (updatedProduct.variants || []).map((v) => {
    const vPrice = Number(v.price) || updatedProduct.price || 0;
    const vSalePrice = typeof v.sale_price === "number" && v.sale_price > 0 && v.sale_price < vPrice && v.sale_price !== 799
      ? v.sale_price
      : undefined;
    return {
      ...v,
      price: vPrice,
      sale_price: vSalePrice,
      stock: Number(v.stock) || 0,
      is_active: v.is_active ?? true,
    };
  });
  updatedProduct.variants = cleanedVariants;

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = {
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        description: updatedProduct.description,
        short_description: updatedProduct.short_description,
        price: updatedProduct.price,
        sale_price: updatedProduct.sale_price,
        stock: updatedProduct.stock,
        rating: updatedProduct.rating,
        review_count: updatedProduct.review_count,
        sales_count: updatedProduct.sales_count,
        thumbnail_url: updatedProduct.thumbnail_url,
        category_name: updatedProduct.category_name,
        category_slug: updatedProduct.category_slug,
        brand_name: updatedProduct.brand_name,
        is_active: updatedProduct.is_active,
        is_featured: updatedProduct.is_featured,
        is_flash_sale: updatedProduct.is_flash_sale,
        variants: cleanedVariants,
        images: updatedProduct.images || [],
        location_tag: updatedProduct.location_tag || "Punjab",
        video_url: updatedProduct.video_url || null,
        specifications: updatedProduct.specifications || {},
      };
      if (isValidUUID(updatedProduct.id)) {
        payload.id = updatedProduct.id;
      }
      const { data, error } = await supabase
        .from("products")
        .upsert(payload, { onConflict: "slug" })
        .select("id")
        .single();

      if (!error && data?.id) {
        updatedProduct.id = data.id;
      }
    } catch {}
  }

  const updatedList = current.some((p) => p.id === updatedProduct.id || p.slug === updatedProduct.slug)
    ? current.map((p) => (p.id === updatedProduct.id || p.slug === updatedProduct.slug ? updatedProduct : p))
    : [updatedProduct, ...current];
  setLocal(STORAGE_KEYS.PRODUCTS, updatedList);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kb_products_updated"));
  }

  return updatedProduct;
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  const current = getLocal<Product>(STORAGE_KEYS.PRODUCTS, []);
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
  const current = getLocal<Property>(STORAGE_KEYS.PROPERTIES, []);
  let updatedProperty: Property;
  const derivedSlug = slugify(property.slug || property.title || `property-${Date.now()}`);

  if (property.id && current.some((p) => p.id === property.id)) {
    updatedProperty = {
      ...current.find((p) => p.id === property.id)!,
      ...property,
      slug: derivedSlug,
    } as Property;
  } else {
    updatedProperty = {
      id: isValidUUID(property.id) ? property.id! : generateUUID(),
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
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = {
        title: updatedProperty.title,
        slug: updatedProperty.slug,
        property_type: updatedProperty.property_type,
        status: updatedProperty.status,
        area_marla: updatedProperty.area_marla,
        price: updatedProperty.price,
        price_display: updatedProperty.price_display,
        location: updatedProperty.location,
        bedrooms: updatedProperty.bedrooms,
        bathrooms: updatedProperty.bathrooms,
        kitchens: updatedProperty.kitchens,
        description: updatedProperty.description,
        is_featured: updatedProperty.is_featured,
        thumbnail_url: updatedProperty.thumbnail_url,
        features: updatedProperty.features || [],
        is_active: updatedProperty.is_active,
        custom_note: updatedProperty.custom_note || "",
      };
      if (isValidUUID(updatedProperty.id)) {
        payload.id = updatedProperty.id;
      }
      const { data, error } = await supabase
        .from("properties")
        .upsert(payload, { onConflict: "slug" })
        .select("id")
        .single();

      if (!error && data?.id) {
        updatedProperty.id = data.id;
      }
    } catch {}
  }

  const updatedList = current.some((p) => p.id === updatedProperty.id || p.slug === updatedProperty.slug)
    ? current.map((p) => (p.id === updatedProperty.id || p.slug === updatedProperty.slug ? updatedProperty : p))
    : [updatedProperty, ...current];
  setLocal(STORAGE_KEYS.PROPERTIES, updatedList);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kb_properties_updated"));
  }

  return updatedProperty;
}

export async function adminDeleteProperty(id: string): Promise<boolean> {
  const current = getLocal<Property>(STORAGE_KEYS.PROPERTIES, []);
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
  const current = getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, []);
  let updatedBook: DigitalBook;
  const derivedSlug = slugify(book.slug || book.title || `book-${Date.now()}`);

  if (book.id && current.some((b) => b.id === book.id)) {
    updatedBook = {
      ...current.find((b) => b.id === book.id)!,
      ...book,
      slug: derivedSlug,
    } as DigitalBook;
  } else {
    updatedBook = {
      id: isValidUUID(book.id) ? book.id! : generateUUID(),
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
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = {
        title: updatedBook.title,
        slug: updatedBook.slug,
        author: updatedBook.author,
        category: updatedBook.category,
        description: updatedBook.description || "",
        price: updatedBook.price,
        sale_price: updatedBook.sale_price,
        cover_url: updatedBook.cover_url,
        file_format: updatedBook.file_format,
        file_size_mb: updatedBook.file_size_mb,
        pages_count: updatedBook.pages_count,
        is_active: updatedBook.is_active,
        is_featured: updatedBook.is_featured ?? false,
      };
      if (isValidUUID(updatedBook.id)) {
        payload.id = updatedBook.id;
      }
      const { data, error } = await supabase
        .from("digital_books")
        .upsert(payload, { onConflict: "slug" })
        .select("id")
        .single();

      if (!error && data?.id) {
        updatedBook.id = data.id;
      }
    } catch {}
  }

  const updatedList = current.some((b) => b.id === updatedBook.id || b.slug === updatedBook.slug)
    ? current.map((b) => (b.id === updatedBook.id || b.slug === updatedBook.slug ? updatedBook : b))
    : [updatedBook, ...current];
  setLocal(STORAGE_KEYS.BOOKS, updatedList);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kb_books_updated"));
  }
  return updatedBook;
}

export async function adminDeleteDigitalBook(id: string): Promise<boolean> {
  const current = getLocal<DigitalBook>(STORAGE_KEYS.BOOKS, []);
  setLocal(STORAGE_KEYS.BOOKS, current.filter((b) => b.id !== id));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("digital_books").delete().eq("id", id);
    } catch {}
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kb_books_updated"));
  }
  return true;
}

// COURSES CRUD
export async function adminSaveCourse(course: Partial<Course>): Promise<Course> {
  const current = getLocal<Course>(STORAGE_KEYS.COURSES, []);
  let updatedCourse: Course;
  const derivedSlug = slugify(course.slug || course.title || `course-${Date.now()}`);

  if (course.id && current.some((c) => c.id === course.id)) {
    updatedCourse = {
      ...current.find((c) => c.id === course.id)!,
      ...course,
      slug: derivedSlug,
    } as Course;
  } else {
    updatedCourse = {
      id: isValidUUID(course.id) ? course.id! : generateUUID(),
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
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = {
        title: updatedCourse.title,
        slug: updatedCourse.slug,
        short_description: updatedCourse.short_description || "",
        description: updatedCourse.description || "",
        instructor: updatedCourse.instructor,
        level: updatedCourse.level,
        duration: updatedCourse.duration,
        modules_count: updatedCourse.modules_count,
        lessons_count: updatedCourse.lessons_count,
        price: updatedCourse.price,
        sale_price: updatedCourse.sale_price,
        thumbnail_url: updatedCourse.thumbnail_url,
        youtube_url: updatedCourse.youtube_url || "",
        is_active: updatedCourse.is_active,
        is_featured: updatedCourse.is_featured ?? false,
      };
      if (isValidUUID(updatedCourse.id)) {
        payload.id = updatedCourse.id;
      }
      const { data, error } = await supabase
        .from("courses")
        .upsert(payload, { onConflict: "slug" })
        .select("id")
        .single();

      if (!error && data?.id) {
        updatedCourse.id = data.id;
      }
    } catch {}
  }

  const updatedList = current.some((c) => c.id === updatedCourse.id || c.slug === updatedCourse.slug)
    ? current.map((c) => (c.id === updatedCourse.id || c.slug === updatedCourse.slug ? updatedCourse : c))
    : [updatedCourse, ...current];
  setLocal(STORAGE_KEYS.COURSES, updatedList);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kb_courses_updated"));
  }
  return updatedCourse;
}

export async function adminDeleteCourse(id: string): Promise<boolean> {
  const current = getLocal<Course>(STORAGE_KEYS.COURSES, []);
  setLocal(STORAGE_KEYS.COURSES, current.filter((c) => c.id !== id));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("courses").delete().eq("id", id);
    } catch {}
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kb_courses_updated"));
  }
  return true;
}

// CATEGORY HIERARCHY HELPERS
export function buildCategoryTree(categories: Category[]): Category[] {
  const catMap = new Map<string, Category>();
  const roots: Category[] = [];

  categories.forEach((cat) => {
    catMap.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach((cat) => {
    const mapped = catMap.get(cat.id)!;
    if (cat.parent_id && catMap.has(cat.parent_id)) {
      catMap.get(cat.parent_id)!.children!.push(mapped);
    } else {
      roots.push(mapped);
    }
  });

  return roots;
}

export function getCategoryBreadcrumbs(categoryId: string, categories: Category[]): string {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const path: string[] = [];
  let curr = catMap.get(categoryId);
  while (curr) {
    path.unshift(curr.name);
    curr = curr.parent_id ? catMap.get(curr.parent_id) : undefined;
  }
  return path.join(" > ");
}

export function getCategoryDescendantSlugs(categorySlug: string, categories: Category[]): string[] {
  if (!categorySlug) return [];
  const cleanTarget = categorySlug.toLowerCase().trim();
  const targetCat = categories.find(
    (c) => c.slug.toLowerCase().trim() === cleanTarget || slugify(c.name) === cleanTarget || c.id === categorySlug
  );
  if (!targetCat) return [categorySlug];

  const resultSlugs: string[] = [targetCat.slug];

  const gatherChildren = (parentId: string) => {
    const children = categories.filter((c) => c.parent_id === parentId);
    for (const child of children) {
      resultSlugs.push(child.slug);
      gatherChildren(child.id);
    }
  };

  gatherChildren(targetCat.id);
  return Array.from(new Set(resultSlugs));
}

// CATEGORIES CRUD
export async function adminSaveCategory(category: Partial<Category>): Promise<Category> {
  const current = getLocal<Category>(STORAGE_KEYS.CATEGORIES, []);
  let updatedCat: Category;
  const derivedSlug = slugify(category.slug || category.name || `cat-${Date.now()}`);

  if (category.id && current.some((c) => c.id === category.id)) {
    updatedCat = {
      ...current.find((c) => c.id === category.id)!,
      ...category,
      parent_id: category.parent_id || null,
      slug: derivedSlug,
    } as Category;
  } else {
    updatedCat = {
      id: isValidUUID(category.id) ? category.id! : generateUUID(),
      name: category.name || "New Category",
      parent_id: category.parent_id || null,
      description: category.description || "",
      image_url: category.image_url || "/assets/cloth-stand-1.jpeg",
      sort_order: category.sort_order ?? (current.length + 1),
      is_active: category.is_active ?? true,
      ...category,
      slug: derivedSlug,
    } as Category;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = {
        name: updatedCat.name,
        slug: updatedCat.slug,
        parent_id: updatedCat.parent_id || null,
        description: updatedCat.description || "",
        image_url: updatedCat.image_url,
        sort_order: updatedCat.sort_order,
        is_active: updatedCat.is_active,
      };
      if (isValidUUID(updatedCat.id)) {
        payload.id = updatedCat.id;
      }
      const { data, error } = await supabase
        .from("categories")
        .upsert(payload, { onConflict: "slug" })
        .select("id")
        .single();

      if (!error && data?.id) {
        updatedCat.id = data.id;
      }
    } catch {}
  }

  const updatedList = current.some((c) => c.id === updatedCat.id || c.slug === updatedCat.slug)
    ? current.map((c) => (c.id === updatedCat.id || c.slug === updatedCat.slug ? updatedCat : c))
    : [...current, updatedCat];
  setLocal(STORAGE_KEYS.CATEGORIES, updatedList);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kb_categories_updated"));
  }
  return updatedCat;
}

export async function adminDeleteCategory(id: string): Promise<boolean> {
  const current = getLocal<Category>(STORAGE_KEYS.CATEGORIES, []);
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
  const current = getLocal<Voucher>(STORAGE_KEYS.VOUCHERS, []);
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

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("vouchers").upsert({
        id: updatedV.id,
        code: updatedV.code,
        discount_type: updatedV.discount_type,
        discount_value: updatedV.discount_value,
        min_spend: updatedV.min_spend,
        is_free_shipping: updatedV.is_free_shipping,
        is_active: updatedV.is_active,
      });
    } catch {}
  }
  return updatedV;
}

export async function adminDeleteVoucher(id: string): Promise<boolean> {
  const current = getLocal<Voucher>(STORAGE_KEYS.VOUCHERS, []);
  setLocal(STORAGE_KEYS.VOUCHERS, current.filter((v) => v.id !== id));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("vouchers").delete().eq("id", id);
    } catch {}
  }
  return true;
}

// BANNERS CRUD
export async function adminSaveBanner(banner: Partial<Banner>): Promise<Banner> {
  const current = getLocal<Banner>(STORAGE_KEYS.BANNERS, []);
  let updatedB: Banner;

  if (banner.id && current.some((b) => b.id === banner.id)) {
    updatedB = { ...current.find((b) => b.id === banner.id)!, ...banner } as Banner;
  } else {
    updatedB = {
      id: isValidUUID(banner.id) ? banner.id! : generateUUID(),
      title: banner.title || "Featured Promotion",
      subtitle: banner.subtitle || "Smart Shopping in Pakistan",
      image_url: banner.image_url || "/assets/ecommerce-banner-1.jpeg",
      link_url: banner.link_url || "/shop",
      cta_text: banner.cta_text || "Shop Deals",
      sort_order: banner.sort_order ?? (current.length + 1),
      is_active: banner.is_active ?? true,
      ...banner,
    } as Banner;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = {
        title: updatedB.title,
        subtitle: updatedB.subtitle || "",
        image_url: updatedB.image_url,
        link_url: updatedB.link_url || "/shop",
        cta_text: updatedB.cta_text || "Shop Deals",
        sort_order: updatedB.sort_order,
        is_active: updatedB.is_active,
      };
      if (isValidUUID(updatedB.id)) {
        payload.id = updatedB.id;
      }
      const { data, error } = await supabase.from("banners").upsert(payload).select("id").single();
      if (!error && data?.id) {
        updatedB.id = data.id;
      }
    } catch {}
  }

  const updatedList = current.some((b) => b.id === updatedB.id)
    ? current.map((b) => (b.id === updatedB.id ? updatedB : b))
    : [updatedB, ...current];
  setLocal(STORAGE_KEYS.BANNERS, updatedList);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kb_banners_updated"));
  }
  return updatedB;
}

export async function adminDeleteBanner(id: string): Promise<boolean> {
  const current = getLocal<Banner>(STORAGE_KEYS.BANNERS, []);
  setLocal(STORAGE_KEYS.BANNERS, current.filter((b) => b.id !== id));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("banners").delete().eq("id", id);
    } catch {}
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kb_banners_updated"));
  }
  return true;
}

// ORDERS MANAGEMENT
export const DEFAULT_SHIPPING_CONFIG: AdminShippingConfig = {
  store_name: "Karobaari Hub & Co.",
  phone: "+92 335 9939702",
  email: "karobaarihub@gmail.com",
  dispatch_address: "Main Stop Shahpur, Adyala Road",
  city: "Rawalpindi / Islamabad",
  province: "Punjab",
  ntn_number: "PK-NTN-893241-7",
  invoice_footer_note: "Thank you for shopping with Karobaari Hub & Co.! For order tracking or support, contact us on WhatsApp.",
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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setLocal(STORAGE_KEYS.ORDERS, data as Order[]);
        return data as Order[];
      }
    } catch {}
  }
  return getLocal<Order>(STORAGE_KEYS.ORDERS, []);
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
      const { id, items, ...payload } = updatedOrder;
      await supabase.from("orders").upsert({ id: updatedOrder.id, ...payload });
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

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("orders").update({ order_status: status }).eq("id", orderId);
    } catch {}
  }
  return true;
}

// INQUIRIES MANAGEMENT
export async function adminGetInquiries(): Promise<PropertyInquiry[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("property_inquiries").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setLocal(STORAGE_KEYS.INQUIRIES, data as PropertyInquiry[]);
        return data as PropertyInquiry[];
      }
    } catch {}
  }
  return getLocal<PropertyInquiry>(STORAGE_KEYS.INQUIRIES, []);
}

export async function adminUpdateInquiryStatus(inquiryId: string, status: PropertyInquiry["status"]): Promise<boolean> {
  const current = getLocal<PropertyInquiry>(STORAGE_KEYS.INQUIRIES, []);
  const updated = current.map((i) => (i.id === inquiryId ? { ...i, status } : i));
  setLocal(STORAGE_KEYS.INQUIRIES, updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("property_inquiries").update({ status }).eq("id", inquiryId);
    } catch {}
  }
  return true;
}

export async function adminDeleteInquiry(inquiryId: string): Promise<boolean> {
  const current = getLocal<PropertyInquiry>(STORAGE_KEYS.INQUIRIES, []);
  setLocal(STORAGE_KEYS.INQUIRIES, current.filter((i) => i.id !== inquiryId));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("property_inquiries").delete().eq("id", inquiryId);
    } catch {}
  }
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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (!error && data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        data.forEach((row: { key: string; value: string }) => {
          settingsMap[row.key] = row.value;
        });
        const merged: SiteSettings = {
          ...initialSiteSettings,
          site_name: settingsMap.site_name || initialSiteSettings.site_name,
          hotline: settingsMap.hotline || initialSiteSettings.hotline,
          whatsapp: settingsMap.whatsapp || settingsMap.whatsapp_number || initialSiteSettings.whatsapp,
          email: settingsMap.email || settingsMap.contact_email || initialSiteSettings.email,
          address: settingsMap.address || initialSiteSettings.address,
          standard_shipping_fee: settingsMap.standard_shipping_fee ? Number(settingsMap.standard_shipping_fee) : initialSiteSettings.standard_shipping_fee,
          free_shipping_threshold: settingsMap.free_shipping_threshold ? Number(settingsMap.free_shipping_threshold) : initialSiteSettings.free_shipping_threshold,
          coins_discount_rate: settingsMap.coins_discount_rate ? Number(settingsMap.coins_discount_rate) : initialSiteSettings.coins_discount_rate,
          cod_enabled: settingsMap.cod_enabled !== undefined ? settingsMap.cod_enabled === "true" : initialSiteSettings.cod_enabled,
          jazzcash_number: settingsMap.jazzcash_number || initialSiteSettings.jazzcash_number,
          jazzcash_title: settingsMap.jazzcash_title || initialSiteSettings.jazzcash_title,
          easypaisa_number: settingsMap.easypaisa_number || initialSiteSettings.easypaisa_number,
          easypaisa_title: settingsMap.easypaisa_title || initialSiteSettings.easypaisa_title,
          bank_name: settingsMap.bank_name || initialSiteSettings.bank_name,
          bank_account_title: settingsMap.bank_account_title || initialSiteSettings.bank_account_title,
          bank_account_number: settingsMap.bank_account_number || initialSiteSettings.bank_account_number,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
        }
        return merged;
      }
    } catch {}
  }

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
      const entries = [
        { key: "site_name", value: settings.site_name || "" },
        { key: "hotline", value: settings.hotline || "" },
        { key: "whatsapp", value: settings.whatsapp || "" },
        { key: "email", value: settings.email || "" },
        { key: "address", value: settings.address || "" },
        { key: "standard_shipping_fee", value: String(settings.standard_shipping_fee ?? 199) },
        { key: "free_shipping_threshold", value: String(settings.free_shipping_threshold ?? 3000) },
        { key: "coins_discount_rate", value: String(settings.coins_discount_rate ?? 0.05) },
        { key: "cod_enabled", value: String(settings.cod_enabled ?? true) },
        { key: "jazzcash_number", value: settings.jazzcash_number || "" },
        { key: "jazzcash_title", value: settings.jazzcash_title || "" },
        { key: "easypaisa_number", value: settings.easypaisa_number || "" },
        { key: "easypaisa_title", value: settings.easypaisa_title || "" },
        { key: "bank_name", value: settings.bank_name || "" },
        { key: "bank_account_title", value: settings.bank_account_title || "" },
        { key: "bank_account_number", value: settings.bank_account_number || "" },
      ];
      for (const entry of entries) {
        await supabase.from("site_settings").upsert(entry, { onConflict: "key" });
      }
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