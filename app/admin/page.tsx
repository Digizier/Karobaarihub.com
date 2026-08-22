"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  Building2,
  BookOpen,
  GraduationCap,
  ShoppingCart,
  Inbox,
  Tags,
  Ticket,
  Sliders,
  Settings,
  Store,
  LogOut,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  Eye,
  EyeOff,
  DollarSign,
  PhoneCall,
  ArrowLeft,
  RefreshCw,
  Zap,
  Menu,
  Printer,
  FileText,
  Truck,
  MapPin,
  Save,
} from "lucide-react";
import {
  Product,
  ProductVariant,
  Property,
  DigitalBook,
  Course,
  Order,
  PropertyInquiry,
  Category,
  Voucher,
  Banner,
  AdminShippingConfig,
  SiteSettings,
} from "@/lib/types";
import {
  getAdminOverview,
  getProducts,
  adminSaveProduct,
  adminDeleteProduct,
  getProperties,
  adminSaveProperty,
  adminDeleteProperty,
  getDigitalBooks,
  adminSaveDigitalBook,
  adminDeleteDigitalBook,
  getCourses,
  adminSaveCourse,
  adminDeleteCourse,
  getCategories,
  adminSaveCategory,
  adminDeleteCategory,
  getVouchers,
  adminSaveVoucher,
  adminDeleteVoucher,
  getBanners,
  adminSaveBanner,
  adminDeleteBanner,
  adminGetOrders,
  adminSaveOrder,
  adminDeleteOrder,
  adminUpdateOrderStatus,
  adminGetInquiries,
  adminUpdateInquiryStatus,
  adminDeleteInquiry,
  adminGetShippingConfig,
  adminSaveShippingConfig,
  DEFAULT_SHIPPING_CONFIG,
  getSiteSettings,
  adminSaveSiteSettings,
  uploadImageFile,
  testSupabaseConnection,
  slugify,
} from "@/lib/db";
import { initialSiteSettings } from "@/lib/mockData";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState("");

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "products"
    | "properties"
    | "books"
    | "courses"
    | "orders"
    | "inquiries"
    | "categories"
    | "vouchers"
    | "banners"
    | "settings"
  >("dashboard");

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [books, setBooks] = useState<DigitalBook[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [shippingConfig, setShippingConfig] = useState<AdminShippingConfig>(DEFAULT_SHIPPING_CONFIG);
  const [isEditingShippingConfig, setIsEditingShippingConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);
  const [editingBook, setEditingBook] = useState<Partial<DigitalBook> | null>(null);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Partial<Voucher> | null>(null);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "product" | "property" | "book" | "course" | "category" | "voucher" | "banner" | "inquiry" | "order";
    id: string;
    title: string;
  } | null>(null);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedNotice, setSettingsSavedNotice] = useState("");

  const [dbStatus, setDbStatus] = useState<{ testing: boolean; connected?: boolean; latencyMs?: number; error?: string }>({
    testing: false,
  });

  useEffect(() => {
    const authSession = sessionStorage.getItem("kb_admin_session");
    if (authSession === "true") {
      setIsAuthenticated(true);
      loadAllData();
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Auto-refresh on window focus (switching tabs/windows)
    const handleFocus = () => loadAllData();
    window.addEventListener("focus", handleFocus);

    // 2. Custom event listeners for real-time local sync
    const handleDataEvent = () => loadAllData();
    window.addEventListener("kb_products_updated", handleDataEvent);
    window.addEventListener("kb_properties_updated", handleDataEvent);
    window.addEventListener("kb_books_updated", handleDataEvent);
    window.addEventListener("kb_courses_updated", handleDataEvent);
    window.addEventListener("kb_categories_updated", handleDataEvent);
    window.addEventListener("kb_settings_updated", handleDataEvent);

    // 3. Periodic cloud poll every 15s to pull other admins' live changes
    const interval = setInterval(() => {
      loadAllData();
    }, 15000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("kb_products_updated", handleDataEvent);
      window.removeEventListener("kb_properties_updated", handleDataEvent);
      window.removeEventListener("kb_books_updated", handleDataEvent);
      window.removeEventListener("kb_courses_updated", handleDataEvent);
      window.removeEventListener("kb_categories_updated", handleDataEvent);
      window.removeEventListener("kb_settings_updated", handleDataEvent);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "karobaari1234@#%" || pin === "admin123" || pin === "786") {
      setIsAuthenticated(true);
      sessionStorage.setItem("kb_admin_session", "true");
      setPinError("");
      loadAllData();
    } else {
      setPinError("Invalid Admin Password. Access Denied.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("kb_admin_session");
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ov, prods, props, bks, crs, ords, inqs, cats, vchs, bnrs, shp, sett] = await Promise.all([
        getAdminOverview().catch(() => null),
        getProducts({ limit: 100 }).catch(() => ({ products: [], total: 0 })),
        getProperties({ limit: 100 }).catch(() => ({ properties: [], total: 0 })),
        getDigitalBooks().catch(() => []),
        getCourses().catch(() => []),
        adminGetOrders().catch(() => []),
        adminGetInquiries().catch(() => []),
        getCategories().catch(() => []),
        getVouchers().catch(() => []),
        getBanners().catch(() => []),
        adminGetShippingConfig().catch(() => DEFAULT_SHIPPING_CONFIG),
        getSiteSettings().catch(() => initialSiteSettings),
      ]);
      setOverview(ov);
      setProducts(prods?.products || []);
      setProperties(props?.properties || []);
      setBooks(bks || []);
      setCourses(crs || []);
      setOrders(ords || []);
      setInquiries(inqs || []);
      setCategories(cats || []);
      setVouchers(vchs || []);
      setBanners(bnrs || []);
      if (shp) setShippingConfig(shp);
      if (sett) setSiteSettings(sett);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await adminSaveSiteSettings(siteSettings);
      setSettingsSavedNotice("Store settings saved successfully and live synced across all pages!");
      setTimeout(() => setSettingsSavedNotice(""), 4000);
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestSupabase = async () => {
    setDbStatus({ testing: true });
    const res = await testSupabaseConnection();
    setDbStatus({ testing: false, ...res });
  };

  const handleImageFilePick = async (e: React.ChangeEvent<HTMLInputElement>, onUploaded: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImageFile(file);
    onUploaded(url);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    const { type, id } = deleteModal;
    if (type === "product") {
      await adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else if (type === "property") {
      await adminDeleteProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } else if (type === "book") {
      await adminDeleteDigitalBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } else if (type === "course") {
      await adminDeleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } else if (type === "category") {
      await adminDeleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else if (type === "voucher") {
      await adminDeleteVoucher(id);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    } else if (type === "banner") {
      await adminDeleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } else if (type === "inquiry") {
      await adminDeleteInquiry(id);
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    } else if (type === "order") {
      await adminDeleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
    setDeleteModal(null);
    loadAllData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="bg-[#1E293B] border border-gray-700 text-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-karobaari-maroon text-karobaari-gold border-2 border-karobaari-gold flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="font-serif font-bold text-xl text-white">Karobaari Hub &amp; Prism</h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">
              Admin Control Panel Login
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Enter Master Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoFocus
                  placeholder="Enter Security Password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:ring-2 focus:ring-karobaari-gold font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinError && <p className="text-xs text-red-400 mt-1.5 font-medium">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-karobaari-maroon to-karobaari-darkMaroon hover:from-red-800 hover:to-karobaari-maroon text-white font-bold text-sm py-3 rounded-xl shadow-lg border border-karobaari-gold/40 transition-transform active:scale-95"
            >
              Access Control Panel
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-700/60 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-karobaari-gold transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "products", label: "Product Manager", icon: Package },
    { id: "properties", label: "Properties Manager", icon: Building2 },
    { id: "books", label: "E-Books Manager", icon: BookOpen },
    { id: "courses", label: "Courses Manager", icon: GraduationCap },
    { id: "orders", label: "Order Manager", icon: ShoppingCart, badge: orders.filter((o) => o.order_status === "Pending").length },
    { id: "inquiries", label: "Inquiries & Visits", icon: Inbox, badge: inquiries.filter((i) => i.status === "New").length },
    { id: "categories", label: "Categories & Tags", icon: Tags },
    { id: "vouchers", label: "Coupon Codes", icon: Ticket },
    { id: "banners", label: "Homepage & Hero Banners", icon: Sliders },
    { id: "settings", label: "Store Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-gray-800 font-sans antialiased">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] text-gray-300 hidden md:flex flex-col justify-between shrink-0 shadow-xl border-r border-gray-800">
        <div className="p-5">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-karobaari-maroon border border-karobaari-gold/50 flex items-center justify-center text-karobaari-gold font-serif font-bold text-sm shadow">
              KH
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-white leading-tight">Karobaari Admin</h2>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Control Panel</span>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-karobaari-maroon text-white shadow-md border border-karobaari-gold/30"
                      : "text-gray-400 hover:bg-gray-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? "text-karobaari-gold" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge) && (
                    <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2 text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-950/40 transition-colors font-medium"
          >
            <Store className="w-4 h-4" />
            <span>View Live Storefront</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/40 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif font-bold text-lg sm:text-xl text-gray-900 leading-tight capitalize">
                {activeTab === "products"
                  ? "Product Catalog Manager"
                  : activeTab === "properties"
                  ? "Prism Real Estate Properties"
                  : activeTab === "books"
                  ? "Digital Books & Blueprints"
                  : activeTab === "courses"
                  ? "Online Video Courses"
                  : activeTab === "orders"
                  ? "Customer Order Manager"
                  : activeTab === "inquiries"
                  ? "Real Estate Client Inquiries"
                  : activeTab === "categories"
                  ? "Departments & Categories"
                  : activeTab === "vouchers"
                  ? "Discount Coupons & Vouchers"
                  : activeTab === "banners"
                  ? "Hero Banners & Promotions"
                  : activeTab === "settings"
                  ? "General Store Settings"
                  : "Executive Overview & Stats"}
              </h1>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                Live management for Karobaari Hub &amp; Prism Real Estate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-3 py-1.5 rounded-xl border border-gray-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-karobaari-maroon" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && overview && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Sales (PKR)</span>
                    <span className="text-xl sm:text-2xl font-serif font-extrabold text-karobaari-maroon">
                      Rs. {overview.totalSales?.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-karobaari-maroon flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Store Orders</span>
                    <span className="text-xl sm:text-2xl font-serif font-extrabold text-gray-900">
                      {overview.totalOrders}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold block">({overview.pendingOrders} Pending)</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Active Products</span>
                    <span className="text-xl sm:text-2xl font-serif font-extrabold text-gray-900">
                      {overview.activeProducts}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Prism Properties</span>
                    <span className="text-xl sm:text-2xl font-serif font-extrabold text-gray-900">
                      {overview.activeProperties}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Recent Orders & Inquiries Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                  <h3 className="font-serif font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Recent Customer Orders</h3>
                  <div className="divide-y divide-gray-100 text-xs">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <strong className="font-mono text-karobaari-maroon">{o.order_number}</strong>
                          <span className="text-gray-600 block">{o.customer_name} ({o.city})</span>
                        </div>
                        <div className="text-right">
                          <strong className="block font-bold">Rs. {o.total_amount?.toLocaleString()}</strong>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 font-bold">{o.order_status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                  <h3 className="font-serif font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Real Estate Client Inquiries</h3>
                  <div className="divide-y divide-gray-100 text-xs">
                    {inquiries.slice(0, 5).map((inq) => (
                      <div key={inq.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <strong className="text-gray-900">{inq.customer_name}</strong>
                          <span className="text-gray-500 block truncate max-w-xs">{inq.property_title}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-600 font-bold block">{inq.customer_phone}</span>
                          <span className="text-[10px] text-gray-400">{inq.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by title, SKU, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800"
                  />
                </div>
                <button
                  onClick={() =>
                    setEditingProduct({
                      name: "",
                      slug: "",
                      price: 999,
                      sale_price: 799,
                      stock: 25,
                      brand_name: "Karobaari Hub",
                      category_name: categories[0]?.name || "Electronic Accessories",
                      category_slug: categories[0]?.slug || "electronic-accessories",
                      location_tag: "Punjab",
                      short_description: "",
                      description: "",
                      thumbnail_url: "/assets/cloth-stand-1.jpeg",
                      images: [],
                      variants: [],
                      is_featured: false,
                      is_flash_sale: false,
                      is_active: true,
                    })
                  }
                  className="bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add New Product
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold">
                        <th className="py-3 px-4">PRODUCT</th>
                        <th className="py-3 px-4">CATEGORY</th>
                        <th className="py-3 px-4">PRICE</th>
                        <th className="py-3 px-4">STOCK</th>
                        <th className="py-3 px-4">BADGES</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(products || [])
                        .filter((p) => (p?.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()))
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                                <Image src={p.thumbnail_url || "/assets/cloth-stand-1.jpeg"} alt={p.name || "Product"} fill unoptimized className="object-cover" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-gray-900 line-clamp-1 block">{p.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono">/product/{p.slug}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{p.category_name}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-karobaari-maroon">Rs. {p.price?.toLocaleString()}</span>
                              {p.sale_price && (
                                <span className="text-[10px] text-gray-400 line-through block">Rs. {p.sale_price}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-bold ${p.stock < 5 ? "text-red-600" : "text-gray-700"}`}>
                                {p.stock} Units
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                {p.is_flash_sale && <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold">Flash</span>}
                                {p.is_featured && <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-bold">Featured</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingProduct({ ...p })}
                                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteModal({ isOpen: true, type: "product", id: p.id, title: p.name })}
                                  className="p-1 hover:bg-red-50 rounded text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROPERTIES */}
          {activeTab === "properties" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search properties by title, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-2 text-xs"
                  />
                </div>
                <button
                  onClick={() =>
                    setEditingProperty({
                      title: "",
                      slug: "",
                      property_type: "House",
                      status: "For Sale",
                      area_marla: 5,
                      price_display: "Rs. 1 Crore 20 Lakh",
                      location: "Main Stop Shahpur, Adyala Road, Rawalpindi",
                      bedrooms: 3,
                      bathrooms: 3,
                      kitchens: 2,
                      description: "Luxury modern house for sale with direct registry.",
                      is_featured: true,
                      thumbnail_url: "/assets/shahpur-house.jpeg",
                      features: ["Direct Registry", "Sweet Water", "Electricity"],
                      is_active: true,
                    })
                  }
                  className="bg-karobaari-maroon text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add New Property
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(properties || []).map((prop) => (
                  <div key={prop.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-[16/10] bg-gray-900">
                        <Image src={prop.thumbnail_url || "/assets/shahpur-house.jpeg"} alt={prop.title || "Property"} fill unoptimized className="object-cover" />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="bg-karobaari-maroon text-white text-[9px] font-bold px-2 py-0.5 rounded">{prop.property_type}</span>
                          <span className="bg-karobaari-gold text-gray-900 text-[9px] font-bold px-2 py-0.5 rounded">{prop.area_marla} Marla</span>
                        </div>
                      </div>
                      <div className="p-3.5">
                        <span className="font-serif font-bold text-sm text-karobaari-maroon block">{prop.price_display}</span>
                        <h4 className="font-bold text-xs text-gray-900 mt-0.5">{prop.title}</h4>
                        <span className="text-[10px] text-gray-500 block truncate">{prop.location}</span>
                      </div>
                    </div>
                    <div className="p-3.5 pt-0 border-t flex justify-between items-center text-[10px] text-gray-400">
                      <span>{prop.status}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditingProperty({ ...prop })} className="p-1 hover:bg-gray-100 rounded"><Edit2 className="w-3.5 h-3.5 text-gray-600" /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, type: "property", id: prop.id, title: prop.title })} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-600" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: E-BOOKS */}
          {activeTab === "books" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="font-serif font-bold text-sm text-gray-900">E-Books &amp; Blueprints ({books.length})</h3>
                <button
                  onClick={() =>
                    setEditingBook({
                      title: "",
                      slug: "",
                      author: "Karobaari Hub Academy",
                      category: "Business",
                      price: 499,
                      sale_price: 299,
                      cover_url: "/assets/ebook-cover.jpeg",
                      file_format: "PDF",
                      pages_count: 85,
                      file_size_mb: 12,
                      is_active: true,
                    })
                  }
                  className="bg-karobaari-maroon text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add E-Book
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(books || []).map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3.5 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-16 bg-gray-100 rounded-lg overflow-hidden border shrink-0">
                        <Image src={b.cover_url || "/assets/ebook-cover.jpeg"} alt={b.title || "Book"} fill unoptimized className="object-cover" />
                      </div>
                      <div>
                        <span className="text-[9px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.2 rounded">{b.category}</span>
                        <h4 className="font-bold text-xs text-gray-900 mt-1 line-clamp-1">{b.title}</h4>
                        <span className="text-[10px] text-gray-400 block">{b.author}</span>
                        <span className="text-xs font-bold text-karobaari-maroon">Rs. {b.price}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setEditingBook({ ...b })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteModal({ isOpen: true, type: "book", id: b.id, title: b.title })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COURSES */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="font-serif font-bold text-sm text-gray-900">Video Courses &amp; Academy ({courses.length})</h3>
                <button
                  onClick={() =>
                    setEditingCourse({
                      title: "",
                      slug: "",
                      instructor: "Prism Business Hub",
                      duration: "12.5 Hours",
                      modules_count: 8,
                      lessons_count: 32,
                      price: 4999,
                      sale_price: 2999,
                      thumbnail_url: "/assets/course-thumb.jpeg",
                      level: "All Levels",
                      is_active: true,
                    })
                  }
                  className="bg-karobaari-maroon text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Course
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(courses || []).map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 aspect-video bg-gray-900 rounded-lg overflow-hidden shrink-0 border">
                        <Image src={c.thumbnail_url || "/assets/course-thumb.jpeg"} alt={c.title || "Course"} fill unoptimized className="object-cover" />
                      </div>
                      <div>
                        <span className="text-[9px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.2 rounded">{c.level}</span>
                        <h4 className="font-bold text-xs text-gray-900 mt-1 line-clamp-1">{c.title}</h4>
                        <span className="text-[10px] text-gray-500 block">{c.duration} &bull; {c.modules_count} Modules</span>
                        <span className="text-xs font-bold text-karobaari-maroon">Rs. {c.price}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setEditingCourse({ ...c })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteModal({ isOpen: true, type: "course", id: c.id, title: c.title })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-5">
              {/* ADMIN SHIPPING & DISPATCH DETAILS CONFIG CARD */}
              <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-karobaari-darkMaroon text-white p-4 sm:p-5 rounded-2xl border border-karobaari-gold/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-karobaari-gold" />
                    <span className="font-serif font-bold text-sm text-white">Admin Shipping &amp; Dispatch Details</span>
                    <span className="text-[10px] bg-karobaari-gold/20 text-karobaari-gold px-2 py-0.5 rounded font-mono">Invoice Header Info</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Sender: <strong className="text-white">{shippingConfig.store_name}</strong> &bull; {shippingConfig.phone} &bull; {shippingConfig.dispatch_address}, {shippingConfig.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingShippingConfig(true)}
                  className="inline-flex items-center gap-1.5 bg-karobaari-gold hover:bg-yellow-500 text-karobaari-darkGray font-bold text-xs px-4 py-2 rounded-xl shadow transition-transform active:scale-95 whitespace-nowrap self-start md:self-auto cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit Shipping &amp; Invoice Info</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-gray-900">All Store Orders ({orders.length})</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold">
                        <th className="py-3 px-4">ORDER #</th>
                        <th className="py-3 px-4">CUSTOMER</th>
                        <th className="py-3 px-4">ADDRESS / CITY</th>
                        <th className="py-3 px-4">AMOUNT</th>
                        <th className="py-3 px-4">METHOD</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono font-bold text-karobaari-maroon">{ord.order_number}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900 block">{ord.customer_name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{ord.customer_phone}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                            {ord.delivery_address}, {ord.city}
                          </td>
                          <td className="py-3 px-4 font-bold text-karobaari-maroon">
                            Rs. {ord.total_amount?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 uppercase font-semibold text-[10px]">{ord.payment_method}</td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.order_status}
                              onChange={(e) => {
                                adminUpdateOrderStatus(ord.id, e.target.value as any);
                                setOrders((prev) =>
                                  prev.map((o) => (o.id === ord.id ? { ...o, order_status: e.target.value as any } : o))
                                );
                              }}
                              className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-[11px] font-bold"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* INVOICE PDF BUTTON */}
                              <button
                                onClick={() => setInvoiceOrder(ord)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-300 transition-colors shadow-2xs cursor-pointer"
                                title="Download / Print PDF Invoice"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Invoice</span>
                              </button>

                              {/* EDIT ORDER BUTTON */}
                              <button
                                onClick={() => setEditingOrder({ ...ord })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-300 transition-colors shadow-2xs cursor-pointer"
                                title="Edit Order Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* QUICK VIEW */}
                              <button
                                onClick={() => setViewingOrder(ord)}
                                className="p-1 hover:text-karobaari-maroon text-gray-500 font-bold hover:bg-gray-100 rounded"
                                title="Quick View"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* DELETE ORDER */}
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, type: "order", id: ord.id, title: `Order ${ord.order_number}` })}
                                className="p-1 hover:text-red-700 text-red-500 font-bold hover:bg-red-50 rounded"
                                title="Delete Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: INQUIRIES */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-gray-900">Property Inspection Leads &amp; Inquiries</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold">
                        <th className="py-3 px-4">CLIENT NAME &amp; PHONE</th>
                        <th className="py-3 px-4">PROPERTY</th>
                        <th className="py-3 px-4">VISIT DATE</th>
                        <th className="py-3 px-4">MESSAGE</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900 block">{inq.customer_name}</span>
                            <a href={`tel:${inq.customer_phone}`} className="text-emerald-600 font-bold text-[11px] hover:underline">
                              {inq.customer_phone}
                            </a>
                          </td>
                          <td className="py-3 px-4 text-gray-800 font-medium max-w-xs truncate">
                            {inq.property_title}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                            {inq.preferred_visit_date || "Anytime"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{inq.message || "-"}</td>
                          <td className="py-3 px-4">
                            <select
                              value={inq.status}
                              onChange={(e) => {
                                adminUpdateInquiryStatus(inq.id, e.target.value as any);
                                setInquiries((prev) =>
                                  prev.map((i) => (i.id === inq.id ? { ...i, status: e.target.value as any } : i))
                                );
                              }}
                              className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-[11px] font-bold"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`https://wa.me/92${inq.customer_phone.replace(/\D/g, "").slice(-10)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="WhatsApp"
                              >
                                <PhoneCall className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, type: "inquiry", id: inq.id, title: inq.customer_name })}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="font-serif font-bold text-sm text-gray-900">Categories &amp; Curated Collections ({categories.length})</h3>
                <button
                  onClick={() =>
                    setEditingCategory({
                      name: "",
                      slug: "",
                      image_url: "/assets/cloth-stand-1.jpeg",
                      sort_order: categories.length + 1,
                      is_active: true,
                    })
                  }
                  className="bg-karobaari-maroon text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-2xl border border-gray-200 p-3 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden border shrink-0">
                        <Image src={cat.image_url || "/assets/cloth-stand-1.jpeg"} alt={cat.name} fill unoptimized className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{cat.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">/{cat.slug}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingCategory({ ...cat })} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteModal({ isOpen: true, type: "category", id: cat.id, title: cat.name })} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: VOUCHERS */}
          {activeTab === "vouchers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="font-serif font-bold text-sm text-gray-900">Discount Coupons &amp; Vouchers ({vouchers.length})</h3>
                <button
                  onClick={() =>
                    setEditingVoucher({
                      code: "SPECIAL500",
                      title: "Flat Rs. 500 Discount",
                      discount_type: "fixed",
                      discount_value: 500,
                      min_spend: 2000,
                      is_free_shipping: false,
                      is_active: true,
                    })
                  }
                  className="bg-karobaari-maroon text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create Coupon Code
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {vouchers.map((v) => (
                  <div key={v.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono font-extrabold text-sm text-karobaari-maroon uppercase">{v.code}</span>
                      <h4 className="font-bold text-xs text-gray-800">{v.title}</h4>
                      <span className="text-[10px] text-gray-500 block">Min Spend: Rs. {v.min_spend}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingVoucher({ ...v })} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteModal({ isOpen: true, type: "voucher", id: v.id, title: v.code })} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: BANNERS */}
          {activeTab === "banners" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="font-serif font-bold text-sm text-gray-900">Homepage Hero Banners ({banners.length})</h3>
                <button
                  onClick={() =>
                    setEditingBanner({
                      title: "New Promotion Banner",
                      subtitle: "Exclusive deals for Pakistan",
                      image_url: "/assets/ecommerce-banner-1.jpeg",
                      link_url: "/shop",
                      cta_text: "Shop Deals",
                      sort_order: banners.length + 1,
                      is_active: true,
                    })
                  }
                  className="bg-karobaari-maroon text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Hero Banner
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(banners || []).map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between">
                    <div className="relative aspect-[21/9] bg-gray-900">
                      <Image src={b.image_url || "/assets/ecommerce-banner-1.jpeg"} alt={b.title || "Banner"} fill unoptimized className="object-cover" />
                    </div>
                    <div className="p-3.5 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-gray-900">{b.title}</h4>
                        <span className="text-[10px] text-gray-400 block">{b.subtitle}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingBanner({ ...b })} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, type: "banner", id: b.id, title: b.title || "Banner" })} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveStoreSettings} className="space-y-6 max-w-4xl">
              {settingsSavedNotice && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{settingsSavedNotice}</span>
                </div>
              )}

              {/* Section 1: Store & Contact Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Store className="w-5 h-5 text-karobaari-maroon" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-gray-900">1. Store Identity &amp; Contact Info</h3>
                    <p className="text-[11px] text-gray-500">Live synced with Header, Footer, and customer WhatsApp links</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-700 block mb-1">Store / Marketplace Title *</label>
                    <input
                      type="text"
                      required
                      value={siteSettings.site_name}
                      onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Official Helpline / Phone *</label>
                    <input
                      type="text"
                      required
                      value={siteSettings.hotline}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hotline: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-mono"
                      placeholder="+92 335 9939 702"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Official WhatsApp Number (Without spaces/+) *</label>
                    <input
                      type="text"
                      required
                      value={siteSettings.whatsapp}
                      onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-mono"
                      placeholder="923359939702"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Customer Support Email *</label>
                    <input
                      type="email"
                      required
                      value={siteSettings.email}
                      onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                      placeholder="support@karobaarihub.com"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Office / Showroom Location *</label>
                    <input
                      type="text"
                      required
                      value={siteSettings.address}
                      onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                      placeholder="Main Stop Shahpur, Adyala Road, Rawalpindi / Islamabad"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Courier Shipping & Delivery Fees */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Truck className="w-5 h-5 text-karobaari-maroon" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-gray-900">2. Courier Shipping &amp; Delivery Charges</h3>
                    <p className="text-[11px] text-gray-500">Controls delivery fees and free shipping triggers in Cart &amp; Checkout</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Standard Courier Shipping Fee (PKR) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={siteSettings.standard_shipping_fee}
                      onChange={(e) => setSiteSettings({ ...siteSettings, standard_shipping_fee: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-sans font-bold"
                      placeholder="199"
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">Default flat shipping fee applied to orders.</span>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Free Shipping Minimum Spend (PKR) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={siteSettings.free_shipping_threshold}
                      onChange={(e) => setSiteSettings({ ...siteSettings, free_shipping_threshold: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-sans font-bold"
                      placeholder="3000"
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">Orders equal to or above this amount get 100% Free Shipping.</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Accounts & Gateways */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <DollarSign className="w-5 h-5 text-karobaari-maroon" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-gray-900">3. Payment Methods &amp; Accounts</h3>
                    <p className="text-[11px] text-gray-500">Configures customer payment options displayed on the Checkout page</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* COD Toggle */}
                  <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.cod_enabled}
                      onChange={(e) => setSiteSettings({ ...siteSettings, cod_enabled: e.target.checked })}
                      className="w-4 h-4 text-karobaari-maroon rounded"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">Enable Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-gray-500">Allow customers to pay cash when courier delivers the parcel</span>
                    </div>
                  </label>

                  {/* JazzCash Account */}
                  <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-3">
                    <h4 className="font-bold text-xs text-red-900 flex items-center gap-1.5">
                      <span>JazzCash Mobile Account</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">JazzCash Account Number</label>
                        <input
                          type="text"
                          value={siteSettings.jazzcash_number}
                          onChange={(e) => setSiteSettings({ ...siteSettings, jazzcash_number: e.target.value })}
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 font-mono"
                          placeholder="0335 9939702"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">JazzCash Account Title</label>
                        <input
                          type="text"
                          value={siteSettings.jazzcash_title}
                          onChange={(e) => setSiteSettings({ ...siteSettings, jazzcash_title: e.target.value })}
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 font-semibold"
                          placeholder="Karobaari Hub"
                        />
                      </div>
                    </div>
                  </div>

                  {/* EasyPaisa Account */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                    <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                      <span>EasyPaisa Mobile Account</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">EasyPaisa Account Number</label>
                        <input
                          type="text"
                          value={siteSettings.easypaisa_number}
                          onChange={(e) => setSiteSettings({ ...siteSettings, easypaisa_number: e.target.value })}
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 font-mono"
                          placeholder="0335 9939702"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">EasyPaisa Account Title</label>
                        <input
                          type="text"
                          value={siteSettings.easypaisa_title}
                          onChange={(e) => setSiteSettings({ ...siteSettings, easypaisa_title: e.target.value })}
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 font-semibold"
                          placeholder="Karobaari Hub"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Account */}
                  <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                    <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                      <span>Official Bank Account (Direct Transfer)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={siteSettings.bank_name || ""}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_name: e.target.value })}
                          className="w-full bg-white border border-gray-300 rounded-lg p-2"
                          placeholder="Meezan Bank Limited"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">Account Title</label>
                        <input
                          type="text"
                          value={siteSettings.bank_account_title || ""}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_account_title: e.target.value })}
                          className="w-full bg-white border border-gray-300 rounded-lg p-2"
                          placeholder="Karobaari Hub & Prism"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">IBAN / Account Number</label>
                        <input
                          type="text"
                          value={siteSettings.bank_account_number || ""}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_account_number: e.target.value })}
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 font-mono"
                          placeholder="PK45MEZN0001234567890101"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg border border-karobaari-gold/40 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? "Saving Settings..." : "Save Store Settings"}</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* ------------------------------------------------ */}
      {/* MODALS */}
      {/* ------------------------------------------------ */}

      {/* PRODUCT ADD/EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-serif font-bold text-base text-gray-900">
                  {editingProduct.id ? "Edit Product Details" : "Add New Marketplace Product"}
                </h3>
                <p className="text-[11px] text-gray-500">Update title, category, pricing, images, and custom variants.</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-900 border-b pb-1">1. Basic Product Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ""}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        name: newName,
                        slug: !editingProduct.id || !editingProduct.slug ? slugify(newName) : editingProduct.slug,
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                    placeholder="e.g. 5 Pcs Unisex Casual Cotton T-Shirts Pack"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Product URL Slug (Auto-generated from title)</label>
                  <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs">
                    <span className="text-gray-400 select-none">/product/</span>
                    <input
                      type="text"
                      value={editingProduct.slug || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, slug: slugify(e.target.value) })}
                      className="bg-transparent border-none outline-hidden w-full font-mono text-karobaari-maroon font-semibold ml-1"
                      placeholder="e.g. 5-pcs-unisex-casual-tshirts-pack"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Store Category *</label>
                  <select
                    value={editingProduct.category_slug || ""}
                    onChange={(e) => {
                      const c = categories.find((cat) => cat.slug === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        category_id: c?.id,
                        category_slug: e.target.value,
                        category_name: c?.name || "General",
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={editingProduct.brand_name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand_name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                    placeholder="e.g. Karobaari Hub"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Regular Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Sale / Discount Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.sale_price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: Number(e.target.value) || undefined })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-karobaari-maroon"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Total Stock Count *</label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 20}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Location / Province Tag</label>
                  <input
                    type="text"
                    value={editingProduct.location_tag || "Punjab"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, location_tag: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                    placeholder="e.g. Islamabad, Punjab"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Short Highlight / Tagline</label>
                  <input
                    type="text"
                    value={editingProduct.short_description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                    placeholder="e.g. Multi-purpose double clothes rack with shoe shelf & heavy load frame."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Full Detailed Description *</label>
                  <textarea
                    rows={4}
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-sans"
                    placeholder="Write detailed product information, features, dimensions, usage, and package contents..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-900 border-b pb-1">2. Product Images &amp; Multi-Photo Gallery</h4>

              {/* Main Thumbnail */}
              <div className="space-y-1.5">
                <span className="font-semibold block">Main Cover Image *</span>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 rounded-xl bg-gray-100 overflow-hidden border border-gray-300 shadow-inner">
                    <Image
                      src={editingProduct.thumbnail_url || "/assets/cloth-stand-1.jpeg"}
                      alt="Main"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <label className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl cursor-pointer shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Main Cover Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageFilePick(e, (url) => setEditingProduct({ ...editingProduct, thumbnail_url: url }))
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Multiple Gallery Images */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold block text-xs">
                      Additional Gallery Photos ({editingProduct.images?.length || 0})
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Upload multiple angles, closeups, and views for the product gallery.
                    </span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-[11px] px-3.5 py-2 rounded-xl cursor-pointer shadow flex-shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Upload Multiple Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        const newImages = [...(editingProduct.images || [])];
                        for (const file of files) {
                          const url = await uploadImageFile(file, "products");
                          newImages.push({
                            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                            product_id: editingProduct.id || "",
                            public_url: url,
                            sort_order: newImages.length + 1,
                            is_primary: false,
                          });
                        }
                        setEditingProduct({ ...editingProduct, images: newImages });
                      }}
                    />
                  </label>
                </div>

                {editingProduct.images && editingProduct.images.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mt-2">
                    {editingProduct.images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="relative group rounded-xl overflow-hidden border border-gray-300 aspect-square bg-gray-50 shadow-xs"
                      >
                        <Image src={img.public_url} alt="Gallery" fill unoptimized className="object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          <button
                            type="button"
                            title="Set as Main Cover"
                            onClick={() => setEditingProduct({ ...editingProduct, thumbnail_url: img.public_url })}
                            className="w-full py-0.5 bg-white/90 text-gray-900 rounded text-[9px] font-bold text-center hover:bg-white"
                          >
                            Set Main
                          </button>
                          <button
                            type="button"
                            title="Delete Photo"
                            onClick={() => {
                              const updated = editingProduct.images!.filter((_, i) => i !== idx);
                              setEditingProduct({ ...editingProduct, images: updated });
                            }}
                            className="w-full py-0.5 bg-red-600 text-white rounded text-[9px] font-bold flex items-center justify-center gap-0.5 hover:bg-red-700"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-500">
                      No extra gallery photos added. Click <strong>+ Upload Multiple Images</strong> above to add more pictures.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1">
                <h4 className="font-bold text-sm text-gray-900">3. Advanced Size &amp; Color Variants Builder</h4>
                <button
                  type="button"
                  onClick={() => {
                    const currentVars = editingProduct.variants || [];
                    const newVar: ProductVariant = {
                      id: `var_${Date.now()}`,
                      product_id: editingProduct.id || "",
                      name: "Option " + (currentVars.length + 1),
                      price: editingProduct.price || 999,
                      sale_price: editingProduct.sale_price,
                      stock: 10,
                      is_active: true,
                    };
                    setEditingProduct({ ...editingProduct, variants: [...currentVars, newVar] });
                  }}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variant Row
                </button>
              </div>

              {editingProduct.variants && editingProduct.variants.length > 0 ? (
                <div className="space-y-2">
                  {editingProduct.variants.map((v, idx) => (
                    <div key={v.id || idx} className="grid grid-cols-4 gap-2 bg-gray-50 p-2.5 rounded-xl border items-center">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">Variant Name</span>
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => {
                            const updated = [...editingProduct.variants!];
                            updated[idx].name = e.target.value;
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          className="w-full bg-white border rounded-lg p-1.5 font-bold text-xs"
                          placeholder="e.g. Red - Large"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">Price (PKR)</span>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...editingProduct.variants!];
                            updated[idx].price = Number(e.target.value);
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          className="w-full bg-white border rounded-lg p-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">Stock</span>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...editingProduct.variants!];
                            updated[idx].stock = Number(e.target.value);
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          className="w-full bg-white border rounded-lg p-1.5 text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProduct.variants!.filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">No custom variants added. Standard item option applies.</p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t">
              <h4 className="font-bold text-sm text-gray-900">4. Promotional Badges &amp; Tags</h4>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_flash_sale ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_flash_sale: e.target.checked })}
                    className="rounded text-karobaari-maroon"
                  />
                  <span className="font-semibold">Flash Sale Countdown</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="rounded text-karobaari-maroon"
                  />
                  <span className="font-semibold">Featured Product</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingProduct.name) return;
                  await adminSaveProduct(editingProduct);
                  setEditingProduct(null);
                  loadAllData();
                }}
                className="px-6 py-2 rounded-xl bg-karobaari-maroon text-white font-bold shadow hover:bg-karobaari-darkMaroon transition-colors"
              >
                Save Product Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROPERTY ADD/EDIT MODAL */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-serif font-bold text-base text-gray-900">
                {editingProperty.id ? "Edit Property Listing" : "Add New Real Estate Property"}
              </h3>
              <button onClick={() => setEditingProperty(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Property Title *</label>
                <input
                  type="text"
                  value={editingProperty.title || ""}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setEditingProperty({
                      ...editingProperty,
                      title: newTitle,
                      slug: !editingProperty.id || !editingProperty.slug ? slugify(newTitle) : editingProperty.slug,
                    });
                  }}
                  className="w-full bg-gray-50 border rounded-xl p-2.5"
                  placeholder="e.g. 5 Marla Brand New House Shahpur"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Property URL Slug (Auto-generated from title)</label>
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs">
                  <span className="text-gray-400 select-none">/real-estate/property/</span>
                  <input
                    type="text"
                    value={editingProperty.slug || ""}
                    onChange={(e) => setEditingProperty({ ...editingProperty, slug: slugify(e.target.value) })}
                    className="bg-transparent border-none outline-hidden w-full font-mono text-karobaari-maroon font-semibold ml-1"
                    placeholder="e.g. 5-marla-brand-new-house-shahpur"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Property Type</label>
                  <select
                    value={editingProperty.property_type || "House"}
                    onChange={(e) => setEditingProperty({ ...editingProperty, property_type: e.target.value as any })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  >
                    <option value="House">House</option>
                    <option value="Plot">Residential Plot</option>
                    <option value="Commercial">Commercial Plaza / Plot</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Area (Marla) *</label>
                  <input
                    type="number"
                    value={editingProperty.area_marla || 5}
                    onChange={(e) => setEditingProperty({ ...editingProperty, area_marla: Number(e.target.value) })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Demand Price Display *</label>
                  <input
                    type="text"
                    value={editingProperty.price_display || "Rs. 1 Crore 20 Lakh"}
                    onChange={(e) => setEditingProperty({ ...editingProperty, price_display: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold text-karobaari-maroon"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Location *</label>
                  <input
                    type="text"
                    value={editingProperty.location || "Main Stop Shahpur, Adyala Road, Rawalpindi"}
                    onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={editingProperty.bedrooms || 3}
                    onChange={(e) => setEditingProperty({ ...editingProperty, bedrooms: Number(e.target.value) })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={editingProperty.bathrooms || 3}
                    onChange={(e) => setEditingProperty({ ...editingProperty, bathrooms: Number(e.target.value) })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="font-bold block">Property Cover Image</span>
                <div className="flex items-center gap-3">
                  <div className="relative w-28 aspect-[16/10] rounded-xl bg-gray-100 overflow-hidden border">
                    <Image src={editingProperty.thumbnail_url || "/assets/shahpur-house.jpeg"} alt="Prop" fill unoptimized className="object-cover" />
                  </div>
                  <label className="bg-gray-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer shadow">
                    <span>Upload Property Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageFilePick(e, (url) => setEditingProperty({ ...editingProperty, thumbnail_url: url }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setEditingProperty(null)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingProperty.title) return;
                  await adminSaveProperty(editingProperty);
                  setEditingProperty(null);
                  loadAllData();
                }}
                className="px-5 py-2 rounded-xl bg-karobaari-maroon text-white font-bold shadow"
              >
                Save Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BANNER EDIT MODAL */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-serif font-bold text-base text-gray-900">
                {editingBanner.id ? "Edit Hero Banner" : "Add Hero Banner"}
              </h3>
              <button onClick={() => setEditingBanner(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div>
              <label className="font-bold block mb-1">Banner Headline Title *</label>
              <input
                type="text"
                value={editingBanner.title || ""}
                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Subtitle / Deal Offer</label>
              <input
                type="text"
                value={editingBanner.subtitle || ""}
                onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                className="w-full bg-gray-50 border rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold block mb-1">Target Link URL</label>
                <input
                  type="text"
                  value={editingBanner.link_url || "/shop"}
                  onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Button CTA Text</label>
                <input
                  type="text"
                  value={editingBanner.cta_text || "Shop Deals"}
                  onChange={(e) => setEditingBanner({ ...editingBanner, cta_text: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold block">Banner Image Background</span>
              <div className="flex items-center gap-3">
                <div className="relative w-28 aspect-[21/9] rounded-xl bg-gray-900 overflow-hidden border">
                  <Image src={editingBanner.image_url || "/assets/ecommerce-banner-1.jpeg"} alt="Banner" fill unoptimized className="object-cover" />
                </div>
                <label className="bg-gray-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer shadow">
                  <span>Upload Graphic</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageFilePick(e, (url) => setEditingBanner({ ...editingBanner, image_url: url }))
                    }
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setEditingBanner(null)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingBanner.title) return;
                  await adminSaveBanner(editingBanner);
                  setEditingBanner(null);
                  loadAllData();
                }}
                className="px-5 py-2 rounded-xl bg-karobaari-maroon text-white font-bold shadow"
              >
                Save &amp; Publish Hero Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-serif font-bold text-base text-gray-900">
                {editingCategory.id ? `Edit Category: ${editingCategory.name}` : "Add Category"}
              </h3>
              <button onClick={() => setEditingCategory(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div>
              <label className="font-bold block mb-1">Category Name *</label>
              <input
                type="text"
                value={editingCategory.name || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    name: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
                className="w-full bg-gray-50 border rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">URL Slug</label>
              <input
                type="text"
                value={editingCategory.slug || ""}
                onChange={(e) => setEditingCategory({ ...editingCategory, slug: slugify(e.target.value) })}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <span className="font-bold block">Category Image Banner</span>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl bg-gray-100 overflow-hidden border">
                  <Image src={editingCategory.image_url || "/assets/cloth-stand-1.jpeg"} alt="Cat" fill unoptimized className="object-cover" />
                </div>
                <label className="bg-gray-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer">
                  <span>Choose file</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageFilePick(e, (url) => setEditingCategory({ ...editingCategory, image_url: url }))
                    }
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingCategory.name) return;
                  await adminSaveCategory(editingCategory);
                  setEditingCategory(null);
                  loadAllData();
                }}
                className="px-5 py-2 rounded-xl bg-karobaari-maroon text-white font-bold"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOUCHER MODAL */}
      {editingVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-serif font-bold text-base text-gray-900">Create / Edit Discount Coupon</h3>
              <button onClick={() => setEditingVoucher(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div>
              <label className="font-bold block mb-1">Coupon Code (e.g. CRAZY500) *</label>
              <input
                type="text"
                value={editingVoucher.code || ""}
                onChange={(e) => setEditingVoucher({ ...editingVoucher, code: e.target.value.toUpperCase() })}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono uppercase font-bold text-karobaari-maroon"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Coupon Title / Description</label>
              <input
                type="text"
                value={editingVoucher.title || ""}
                onChange={(e) => setEditingVoucher({ ...editingVoucher, title: e.target.value })}
                className="w-full bg-gray-50 border rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold block mb-1">Discount Amount (PKR)</label>
                <input
                  type="number"
                  value={editingVoucher.discount_value || 500}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, discount_value: Number(e.target.value) })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Min Order Spend (PKR)</label>
                <input
                  type="number"
                  value={editingVoucher.min_spend || 2000}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, min_spend: Number(e.target.value) })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setEditingVoucher(null)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingVoucher.code) return;
                  await adminSaveVoucher(editingVoucher);
                  setEditingVoucher(null);
                  loadAllData();
                }}
                className="px-5 py-2 rounded-xl bg-karobaari-maroon text-white font-bold"
              >
                Save Coupon Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOK EDIT MODAL */}
      {editingBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-3.5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-serif font-bold text-base text-gray-900">
                  {editingBook.id ? "Edit E-Book" : "Add New E-Book"}
                </h3>
                <p className="text-[11px] text-gray-500">Configure book details, pricing, format, pages, and download specs.</p>
              </div>
              <button onClick={() => setEditingBook(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div>
              <label className="font-bold block mb-1 text-gray-700">E-Book Title *</label>
              <input
                type="text"
                value={editingBook.title || ""}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setEditingBook({
                    ...editingBook,
                    title: newTitle,
                    slug: !editingBook.id || !editingBook.slug ? slugify(newTitle) : editingBook.slug,
                  });
                }}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-medium"
                placeholder="e.g. E-Commerce Karobaar Guide Pakistan"
              />
            </div>

            <div>
              <label className="font-bold block mb-1 text-gray-700">E-Book URL Slug (Auto-generated from title)</label>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs">
                <span className="text-gray-400 select-none font-mono">/digital-books/</span>
                <input
                  type="text"
                  value={editingBook.slug || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, slug: slugify(e.target.value) })}
                  className="bg-transparent border-none outline-hidden w-full font-mono text-karobaari-maroon font-semibold ml-1"
                  placeholder="e.g. ecommerce-karobaar-guide-pakistan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold block mb-1 text-gray-700">Author</label>
                <input
                  type="text"
                  value={editingBook.author || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  placeholder="e.g. Karobaari Hub Academy"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-gray-700">Category</label>
                <input
                  type="text"
                  value={editingBook.category || "Business"}
                  onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                  placeholder="e.g. Business, Real Estate, Investment"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold block mb-1 text-gray-700">Regular Price (PKR)</label>
                <input
                  type="number"
                  value={editingBook.price ?? 499}
                  onChange={(e) => setEditingBook({ ...editingBook, price: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-gray-700">Sale / Offer Price (PKR)</label>
                <input
                  type="number"
                  value={editingBook.sale_price ?? 299}
                  onChange={(e) => setEditingBook({ ...editingBook, sale_price: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 299"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-karobaari-maroon"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="font-bold block mb-1 text-gray-700">Format</label>
                <select
                  value={editingBook.file_format || "PDF"}
                  onChange={(e) => setEditingBook({ ...editingBook, file_format: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-semibold"
                >
                  <option value="PDF">PDF</option>
                  <option value="EPUB">EPUB</option>
                  <option value="PDF + Audio">PDF + Audio</option>
                  <option value="ZIP / Bundle">ZIP / Bundle</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1 text-gray-700">Pages Count</label>
                <input
                  type="number"
                  value={editingBook.pages_count ?? 85}
                  onChange={(e) => setEditingBook({ ...editingBook, pages_count: Number(e.target.value) })}
                  placeholder="e.g. 85"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-gray-700">Size (MB)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingBook.file_size_mb ?? 12}
                  onChange={(e) => setEditingBook({ ...editingBook, file_size_mb: Number(e.target.value) })}
                  placeholder="e.g. 12"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1 text-gray-700">Description / Key Chapters</label>
              <textarea
                rows={3}
                value={editingBook.description || ""}
                onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                placeholder="Comprehensive overview, chapter breakdown, and practical insights provided in this e-book..."
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
              />
            </div>

            <div className="space-y-1.5">
              <span className="font-bold block text-gray-700">E-Book Cover Art</span>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                  <Image src={editingBook.cover_url || "/assets/ebook-cover.jpeg"} alt="Cover" fill unoptimized className="object-cover" />
                </div>
                <label className="bg-gray-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors">
                  <span>Upload Cover Art</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageFilePick(e, (url) => setEditingBook({ ...editingBook, cover_url: url }))
                    }
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingBook(null)} className="px-4 py-2 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingBook.title) return;
                  await adminSaveDigitalBook(editingBook);
                  setEditingBook(null);
                  loadAllData();
                }}
                className="px-5 py-2 rounded-xl bg-karobaari-maroon text-white font-bold hover:bg-karobaari-darkMaroon transition-colors"
              >
                Save E-Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COURSE EDIT MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-3.5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-serif font-bold text-base text-gray-900">
                  {editingCourse.id ? "Edit Video Course" : "Add New Video Course"}
                </h3>
                <p className="text-[11px] text-gray-500">Configure curriculum, instructor, duration, modules, and pricing.</p>
              </div>
              <button onClick={() => setEditingCourse(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div>
              <label className="font-bold block mb-1 text-gray-700">Course Title *</label>
              <input
                type="text"
                value={editingCourse.title || ""}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setEditingCourse({
                    ...editingCourse,
                    title: newTitle,
                    slug: !editingCourse.id || !editingCourse.slug ? slugify(newTitle) : editingCourse.slug,
                  });
                }}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-medium"
                placeholder="e.g. Mastering Dropshipping Pakistan"
              />
            </div>

            <div>
              <label className="font-bold block mb-1 text-gray-700">Course URL Slug (Auto-generated from title)</label>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs">
                <span className="text-gray-400 select-none font-mono">/courses/</span>
                <input
                  type="text"
                  value={editingCourse.slug || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, slug: slugify(e.target.value) })}
                  className="bg-transparent border-none outline-hidden w-full font-mono text-karobaari-maroon font-semibold ml-1"
                  placeholder="e.g. mastering-dropshipping-pakistan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold block mb-1 text-gray-700">Instructor / Mentor</label>
                <input
                  type="text"
                  value={editingCourse.instructor || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                  placeholder="e.g. Prism Business Academy"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-gray-700">Skill Level</label>
                <select
                  value={editingCourse.level || "All Levels"}
                  onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value as any })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-semibold"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="font-bold block mb-1 text-gray-700">Duration</label>
                <input
                  type="text"
                  value={editingCourse.duration || "10 Hours"}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  placeholder="e.g. 10 Hours"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-gray-700">Modules Count</label>
                <input
                  type="number"
                  value={editingCourse.modules_count ?? 6}
                  onChange={(e) => setEditingCourse({ ...editingCourse, modules_count: Number(e.target.value) })}
                  placeholder="e.g. 6"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-gray-700">Lessons Count</label>
                <input
                  type="number"
                  value={editingCourse.lessons_count ?? 24}
                  onChange={(e) => setEditingCourse({ ...editingCourse, lessons_count: Number(e.target.value) })}
                  placeholder="e.g. 24"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold block mb-1 text-gray-700">Regular Price (PKR)</label>
                <input
                  type="number"
                  value={editingCourse.price ?? 4999}
                  onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-gray-700">Sale / Offer Price (PKR)</label>
                <input
                  type="number"
                  value={editingCourse.sale_price ?? 2999}
                  onChange={(e) => setEditingCourse({ ...editingCourse, sale_price: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 2999"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-karobaari-maroon"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1 text-gray-700">Short Summary</label>
              <input
                type="text"
                value={editingCourse.short_description || ""}
                onChange={(e) => setEditingCourse({ ...editingCourse, short_description: e.target.value })}
                placeholder="High-converting Pakistani e-commerce strategy & step-by-step masterclass..."
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="font-bold block mb-1 text-gray-700">YouTube Video / Playlist URL</label>
              <input
                type="url"
                value={editingCourse.youtube_url || ""}
                onChange={(e) => setEditingCourse({ ...editingCourse, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... or playlist link"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-mono text-xs"
              />
              <p className="text-[10px] text-gray-400 mt-1">When students click &quot;Watch Video&quot; or the player, they will be redirected to this YouTube link.</p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold block text-gray-700">Course Thumbnail</span>
              <div className="flex items-center gap-3">
                <div className="relative w-24 aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                  <Image src={editingCourse.thumbnail_url || "/assets/course-thumb.jpeg"} alt="Thumb" fill unoptimized className="object-cover" />
                </div>
                <label className="bg-gray-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors">
                  <span>Upload Thumbnail</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageFilePick(e, (url) => setEditingCourse({ ...editingCourse, thumbnail_url: url }))
                    }
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingCourse(null)} className="px-4 py-2 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingCourse.title) return;
                  await adminSaveCourse(editingCourse);
                  setEditingCourse(null);
                  loadAllData();
                }}
                className="px-5 py-2 rounded-xl bg-karobaari-maroon text-white font-bold hover:bg-karobaari-darkMaroon transition-colors"
              >
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SHIPPING & STORE DETAILS CONFIG MODAL */}
      {isEditingShippingConfig && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-karobaari-maroon" />
                <h3 className="font-serif font-bold text-base text-gray-900">
                  Admin Shipping &amp; Store Invoice Settings
                </h3>
              </div>
              <button onClick={() => setIsEditingShippingConfig(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-500 text-[11px] leading-relaxed">
              These details are printed as the Official Shipper / Dispatcher on all Customer Invoices &amp; Delivery Slips.
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Company / Store Name *</label>
                <input
                  type="text"
                  value={shippingConfig.store_name}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, store_name: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Helpline Phone / WhatsApp *</label>
                  <input
                    type="text"
                    value={shippingConfig.phone}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, phone: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono text-emerald-700 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={shippingConfig.email}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, email: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Warehouse / Dispatch Address *</label>
                <input
                  type="text"
                  value={shippingConfig.dispatch_address}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, dispatch_address: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">City</label>
                  <input
                    type="text"
                    value={shippingConfig.city}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, city: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Province</label>
                  <input
                    type="text"
                    value={shippingConfig.province}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, province: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">NTN / Registration Number (Optional)</label>
                <input
                  type="text"
                  value={shippingConfig.ntn_number || ""}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, ntn_number: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono"
                  placeholder="e.g. PK-NTN-893241-7"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Invoice Footer Note</label>
                <input
                  type="text"
                  value={shippingConfig.invoice_footer_note || ""}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, invoice_footer_note: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Return &amp; Warranty Policy Note</label>
                <input
                  type="text"
                  value={shippingConfig.return_policy_note || ""}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, return_policy_note: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingShippingConfig(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await adminSaveShippingConfig(shippingConfig);
                  setIsEditingShippingConfig(false);
                }}
                className="px-5 py-2 rounded-xl bg-karobaari-maroon text-white font-bold shadow hover:bg-karobaari-darkMaroon transition-colors"
              >
                Save Shipping Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ORDER DETAILS MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-serif font-bold text-base text-gray-900">
                  Edit Order #{editingOrder.order_number}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">ID: {editingOrder.id}</span>
              </div>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs text-gray-900 border-b pb-1">1. Customer &amp; Delivery Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    value={editingOrder.customer_name || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer_name: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={editingOrder.customer_phone || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer_phone: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono text-emerald-700 font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1">Delivery Address *</label>
                  <input
                    type="text"
                    value={editingOrder.delivery_address || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, delivery_address: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    value={editingOrder.city || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Province</label>
                  <input
                    type="text"
                    value={editingOrder.province || "Punjab"}
                    onChange={(e) => setEditingOrder({ ...editingOrder, province: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                  />
                </div>
              </div>

              <h4 className="font-bold text-xs text-gray-900 border-b pb-1 pt-2">2. Order Status &amp; Financials</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Order Status</label>
                  <select
                    value={editingOrder.order_status || "Pending"}
                    onChange={(e) => setEditingOrder({ ...editingOrder, order_status: e.target.value as any })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Payment Method</label>
                  <select
                    value={editingOrder.payment_method || "COD"}
                    onChange={(e) => setEditingOrder({ ...editingOrder, payment_method: e.target.value as any })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Payment Status</label>
                  <select
                    value={editingOrder.payment_status || "Pending"}
                    onChange={(e) => setEditingOrder({ ...editingOrder, payment_status: e.target.value as any })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Subtotal (PKR)</label>
                  <input
                    type="number"
                    value={editingOrder.subtotal || 0}
                    onChange={(e) => {
                      const sub = Number(e.target.value) || 0;
                      const ship = editingOrder.shipping_fee ?? 199;
                      const disc = editingOrder.discount_amount || 0;
                      setEditingOrder({ ...editingOrder, subtotal: sub, total_amount: Math.max(0, sub + ship - disc) });
                    }}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Shipping Fee (PKR)</label>
                  <input
                    type="number"
                    value={editingOrder.shipping_fee ?? 199}
                    onChange={(e) => {
                      const ship = Number(e.target.value) || 0;
                      const sub = editingOrder.subtotal || 0;
                      const disc = editingOrder.discount_amount || 0;
                      setEditingOrder({ ...editingOrder, shipping_fee: ship, total_amount: Math.max(0, sub + ship - disc) });
                    }}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Grand Total (PKR) *</label>
                  <input
                    type="number"
                    value={editingOrder.total_amount || 0}
                    onChange={(e) => setEditingOrder({ ...editingOrder, total_amount: Number(e.target.value) || 0 })}
                    className="w-full bg-red-50 border border-red-300 rounded-xl p-2.5 font-mono font-extrabold text-karobaari-maroon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Courier Tracking / Token No.</label>
                  <input
                    type="text"
                    value={editingOrder.tracking_token || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, tracking_token: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono font-bold"
                    placeholder="e.g. TRK-78945612"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Customer / Delivery Note</label>
                  <input
                    type="text"
                    value={editingOrder.customer_notes || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer_notes: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5"
                    placeholder="e.g. Call before delivery"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingOrder.id) return;
                  await adminSaveOrder(editingOrder);
                  setEditingOrder(null);
                  loadAllData();
                }}
                className="px-5 py-2 rounded-xl bg-karobaari-maroon text-white font-bold shadow hover:bg-karobaari-darkMaroon transition-colors"
              >
                Save Order Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PURE WHITE PRINTABLE PDF INVOICE MODAL */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-300">
            {/* Top Action Bar (hidden during print) */}
            <div className="no-print bg-gray-900 text-white p-3 sm:p-4 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-karobaari-gold" />
                <span className="font-serif font-bold text-sm">Official Commercial Invoice</span>
                <span className="font-mono text-xs text-karobaari-gold bg-black/40 px-2 py-0.5 rounded">
                  {invoiceOrder.order_number}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 bg-karobaari-gold hover:bg-yellow-400 text-gray-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE INVOICE SHEET (Pure White, Pristine Typography) */}
            <div id="printable-invoice" className="printable-invoice-container bg-white text-gray-900 p-6 sm:p-10 font-sans text-xs">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-gray-900 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-extrabold text-xl sm:text-2xl text-karobaari-maroon tracking-tight">
                      {shippingConfig.store_name}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1 text-[11px]">
                    {shippingConfig.dispatch_address}, {shippingConfig.city}, {shippingConfig.province}
                  </p>
                  <p className="text-gray-600 text-[11px]">
                    Phone: <strong>{shippingConfig.phone}</strong> &bull; Email: {shippingConfig.email}
                  </p>
                  {shippingConfig.ntn_number && (
                    <p className="text-gray-500 text-[10px] font-mono mt-0.5">
                      NTN / Reg: {shippingConfig.ntn_number}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <span className="bg-karobaari-maroon text-white font-serif font-bold text-xs uppercase px-3 py-1 rounded inline-block mb-1 tracking-wider">
                    Sales Tax &amp; Delivery Invoice
                  </span>
                  <div className="font-mono text-sm font-extrabold text-gray-900">
                    INV-{invoiceOrder.order_number}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Date: {invoiceOrder.created_at ? new Date(invoiceOrder.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString()}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    Tracking: {invoiceOrder.tracking_token || "N/A"}
                  </div>
                </div>
              </div>

              {/* Shipper & Consignee Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 py-4 bg-gray-50/80 rounded-xl p-4 border border-gray-200">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1 tracking-wider">
                    DISPATCH FROM (SHIPPER):
                  </span>
                  <h4 className="font-bold text-gray-900 text-xs">{shippingConfig.store_name}</h4>
                  <p className="text-gray-600 mt-0.5">{shippingConfig.dispatch_address}</p>
                  <p className="text-gray-600">{shippingConfig.city}, {shippingConfig.province}</p>
                  <p className="text-gray-700 font-semibold mt-1">Helpline: {shippingConfig.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase text-karobaari-maroon block mb-1 tracking-wider">
                    DELIVER TO (CUSTOMER / RECIPIENT):
                  </span>
                  <h4 className="font-bold text-gray-900 text-xs">{invoiceOrder.customer_name}</h4>
                  <p className="text-gray-600 mt-0.5">{invoiceOrder.delivery_address}</p>
                  <p className="text-gray-600">{invoiceOrder.city}, {invoiceOrder.province} {invoiceOrder.address_label ? `(${invoiceOrder.address_label})` : ""}</p>
                  <p className="text-gray-900 font-bold mt-1">Phone: {invoiceOrder.customer_phone}</p>
                  {invoiceOrder.customer_email && (
                    <p className="text-gray-500 text-[10px]">{invoiceOrder.customer_email}</p>
                  )}
                </div>
              </div>

              {/* Order Payment & Status Bar */}
              <div className="flex flex-wrap items-center justify-between bg-gray-100 p-2.5 rounded-lg border border-gray-200 mb-6 text-[11px]">
                <div>
                  <span className="text-gray-500">Payment Method: </span>
                  <strong className="text-karobaari-maroon uppercase font-bold">{invoiceOrder.payment_method}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Payment Status: </span>
                  <strong className={`font-bold ${invoiceOrder.payment_status === "Paid" ? "text-emerald-700" : "text-amber-700"}`}>
                    {invoiceOrder.payment_status || "Pending"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">Order Status: </span>
                  <strong className="text-gray-900 font-bold">{invoiceOrder.order_status}</strong>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700 font-bold text-[10px] uppercase border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {invoiceOrder.items && invoiceOrder.items.length > 0 ? (
                      invoiceOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-mono text-gray-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-900">
                            <div>{item.product_name_snapshot}</div>
                            {item.variant_snapshot && (
                              <span className="text-[10px] text-gray-500 block">Option: {item.variant_snapshot}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">Rs. {item.unit_price?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono">Rs. {item.line_total?.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 px-3 font-mono">1</td>
                        <td className="py-2.5 px-3 font-medium">Standard Marketplace Parcel Package</td>
                        <td className="py-2.5 px-3 text-center font-bold">1</td>
                        <td className="py-2.5 px-3 text-right font-mono">Rs. {invoiceOrder.subtotal?.toLocaleString() || invoiceOrder.total_amount?.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono">Rs. {invoiceOrder.subtotal?.toLocaleString() || invoiceOrder.total_amount?.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="max-w-xs space-y-1 text-[11px] text-gray-600">
                  {invoiceOrder.customer_notes && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-900">
                      <strong>Delivery Notes: </strong> {invoiceOrder.customer_notes}
                    </div>
                  )}
                  <p className="italic">{shippingConfig.return_policy_note}</p>
                </div>

                <div className="w-full sm:w-64 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">Rs. {invoiceOrder.subtotal?.toLocaleString() || (invoiceOrder.total_amount - (invoiceOrder.shipping_fee || 199))?.toLocaleString()}</span>
                  </div>
                  {invoiceOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>Voucher Discount:</span>
                      <span className="font-mono">-Rs. {invoiceOrder.discount_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery / Courier Fee:</span>
                    <span className="font-mono font-semibold">Rs. {(invoiceOrder.shipping_fee ?? 199).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-karobaari-maroon pt-2 border-t-2 border-gray-300">
                    <span>Total Payable:</span>
                    <span className="font-mono">Rs. {invoiceOrder.total_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer */}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-500">
                <div>
                  <p className="font-semibold text-gray-700">{shippingConfig.invoice_footer_note}</p>
                  <p className="mt-0.5">This is a system generated tax invoice and does not require physical signature.</p>
                </div>
                <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="font-serif font-bold text-gray-900 text-xs uppercase tracking-wider">
                    {shippingConfig.store_name}
                  </div>
                  <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest block mt-0.5">
                    &bull; Official Dispatch Verified &bull;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW ORDER RECEIPT MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <span className="font-mono font-bold text-karobaari-maroon text-sm block">
                  Order {viewingOrder.order_number}
                </span>
                <span className="text-[10px] text-gray-400">Token: {viewingOrder.tracking_token}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const ord = viewingOrder;
                    setViewingOrder(null);
                    setInvoiceOrder(ord);
                  }}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-300 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button onClick={() => setViewingOrder(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-bold text-gray-900">{viewingOrder.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-bold text-emerald-600">{viewingOrder.customer_phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Address:</span><span className="font-semibold text-gray-800 text-right">{viewingOrder.delivery_address}, {viewingOrder.city}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Method:</span><span className="font-bold uppercase text-karobaari-maroon">{viewingOrder.payment_method}</span></div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Order Items</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {viewingOrder.items && viewingOrder.items.length > 0 ? (
                  viewingOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between border-b pb-1">
                      <span>{it.product_name_snapshot} (x{it.quantity})</span>
                      <span className="font-bold">Rs. {it.line_total?.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Standard item package.</p>
                )}
              </div>
            </div>

            <div className="border-t pt-2 flex justify-between text-sm font-extrabold text-karobaari-maroon">
              <span>Grand Total:</span>
              <span>Rs. {viewingOrder.total_amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl animate-fadeIn space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="font-serif font-bold text-lg text-gray-900 leading-snug">
              Delete {deleteModal.type.toUpperCase()} &ldquo;{deleteModal.title}&rdquo;?
            </h3>

            <p className="text-xs text-gray-500 leading-relaxed">
              This action will permanently delete this item from your catalog/database.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Yes, Delete {deleteModal.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
