export type BusinessType = "ecommerce" | "real_estate" | "digital_book" | "course";

export interface Category {
  id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  name: string;
  attributes?: Record<string, string>; // e.g. { color: "Maroon", size: "XL" }
  price: number;
  sale_price?: number | null;
  stock: number;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  public_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  category_id?: string | null;
  category_name?: string;
  category_slug?: string;
  brand_name?: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  sale_price?: number | null;
  sku?: string;
  stock: number;
  thumbnail_url: string;
  is_active: boolean;
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_end?: string | null;
  rating: number;
  review_count: number;
  sales_count: number;
  location_tag?: string; // e.g. "Punjab", "Sindh"
  variants?: ProductVariant[];
  images?: ProductImage[];
  specifications?: Record<string, string>;
  created_at?: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  property_type: "House" | "Plot" | "Commercial" | "Farmhouse" | "Apartment";
  status: "For Sale" | "For Rent" | "Sold" | "Under Offer";
  location: string;
  area_marla: number;
  price: number;
  price_display: string;
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  description: string;
  features: string[];
  thumbnail_url: string;
  images?: { id: string; public_url: string; alt_text?: string }[];
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface PropertyInquiry {
  id: string;
  property_id?: string | null;
  property_title?: string;
  customer_name: string;
  customer_phone: string;
  message?: string;
  preferred_visit_date?: string;
  status?: "New" | "Contacted" | "Scheduled" | "Closed" | "Completed" | "Cancelled";
  created_at?: string;
}

export interface DigitalBook {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  description: string;
  price: number;
  sale_price?: number | null;
  cover_url: string;
  file_storage_path?: string;
  sample_preview_url?: string;
  file_format: string; // PDF, EPUB
  file_size_mb: number;
  pages_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  instructor: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  duration: string;
  modules_count: number;
  lessons_count: number;
  price: number;
  sale_price?: number | null;
  thumbnail_url: string;
  youtube_url?: string;
  curriculum?: { module_title: string; lessons: string[] }[];
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface CartItem {
  id: string; // unique item cart key: product_id or variant_id
  product_id: string;
  type: BusinessType;
  title: string;
  slug: string;
  price: number;
  original_price?: number | null;
  quantity: number;
  thumbnail_url: string;
  variant_name?: string;
  stock_available: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string | null;
  product_name_snapshot: string;
  sku_snapshot?: string;
  variant_snapshot?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  province: string;
  city: string;
  area?: string;
  delivery_address: string;
  address_label: "Home" | "Office";
  subtotal: number;
  voucher_code?: string;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: "COD" | "JazzCash" | "EasyPaisa" | "Bank Transfer";
  payment_status: "Pending" | "Paid" | "Failed";
  order_status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
  tracking_token: string;
  customer_notes?: string;
  items?: OrderItem[];
  created_at?: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url: string;
  cta_text?: string;
  bg_gradient?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_spend: number;
  max_discount?: number | null;
  is_free_shipping: boolean;
  expiry_date?: string;
  is_active: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  display_name: string;
  rating: number;
  title?: string;
  comment: string;
  photo_urls?: string[];
  is_verified_purchase: boolean;
  status: "Approved" | "Pending" | "Hidden";
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar_url?: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
}

export interface SiteSettings {
  site_name: string;
  hotline: string;
  whatsapp: string;
  email: string;
  address: string;
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  coins_discount_rate: number;
  cod_enabled: boolean;
  jazzcash_number: string;
  jazzcash_title: string;
  easypaisa_number: string;
  easypaisa_title: string;
  bank_name?: string;
  bank_account_title?: string;
  bank_account_number?: string;
}

export interface AdminShippingConfig {
  store_name: string;
  phone: string;
  email: string;
  dispatch_address: string;
  city: string;
  province: string;
  ntn_number?: string;
  invoice_footer_note?: string;
  return_policy_note?: string;
}