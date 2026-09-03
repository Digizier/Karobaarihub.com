"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Phone,
  HelpCircle,
  Package,
  Building2,
  BookOpen,
  GraduationCap,
  Sparkles,
  X,
  Clock,
  Trash2,
  Menu,
  ChevronDown,
  Lock,
} from "lucide-react";
import Logo from "./Logo";
import DarazCategoryMenu from "./DarazCategoryMenu";
import { getCartItems, getCartCount, openCartDrawer } from "@/lib/cart";
import { getSiteSettings, getCategories } from "@/lib/db";
import { initialSiteSettings } from "@/lib/mockData";
import { SiteSettings, Category } from "@/lib/types";

export default function Header() {
  const router = useRouter();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "Sublimation Machine",
    "4 Marla House Shahpur",
    "Heat Press Machine",
    "Cloth Hanging Stand",
    "E-Commerce Course",
  ]);
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCount = () => {
      const items = getCartItems();
      setCartCount(getCartCount(items));
    };
    const updateSettings = () => {
      getSiteSettings().then((s) => {
        if (s) setSiteSettings(s);
      });
    };
    const updateCategories = () => {
      getCategories().then((cats) => {
        if (cats) setCategories(cats);
      });
    };
    updateCount();
    updateSettings();
    updateCategories();
    window.addEventListener("kb_cart_updated", updateCount);
    window.addEventListener("kb_settings_updated", updateSettings);
    window.addEventListener("kb_categories_updated", updateCategories);
    return () => {
      window.removeEventListener("kb_cart_updated", updateCount);
      window.removeEventListener("kb_settings_updated", updateSettings);
      window.removeEventListener("kb_categories_updated", updateCategories);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!searchHistory.includes(searchQuery.trim())) {
      setSearchHistory([searchQuery.trim(), ...searchHistory.slice(0, 5)]);
    }
    setIsSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setIsSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(tag)}`);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md w-full">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-karobaari-darkGray text-gray-200 text-[11px] sm:text-xs py-1.5 border-b border-karobaari-darkMaroon w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href={`tel:${siteSettings.hotline?.replace(/\s+/g, "") || "+923359939702"}`} className="flex items-center gap-1 hover:text-karobaari-gold transition-colors font-medium">
              <Phone className="w-3 h-3 text-karobaari-gold flex-shrink-0" />
              <span>{siteSettings.hotline || "+92 335 9939 702"}</span>
            </a>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden lg:inline text-gray-300 truncate max-w-xs">{siteSettings.address || "Shahpur, Adyala Road, Rawalpindi"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/track-order" className="flex items-center gap-1 hover:text-karobaari-gold transition-colors">
              <Package className="w-3 h-3 flex-shrink-0" />
              <span>Track Order</span>
            </Link>
            <Link href="/contact" className="hidden sm:flex items-center gap-1 hover:text-karobaari-gold transition-colors">
              <HelpCircle className="w-3 h-3 flex-shrink-0" />
              <span>Help</span>
            </Link>
            {/* Desktop-only Admin Link */}
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1 text-karobaari-gold hover:text-white font-medium bg-karobaari-maroon/40 px-2 py-0.5 rounded border border-karobaari-gold/40 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Mobile Optimized 2-Row Layout, Desktop 1-Row) */}
      <div className="bg-karobaari-maroon text-white py-2.5 sm:py-3.5 border-b-2 border-karobaari-gold w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Mobile Top Row: Logo + Cart */}
          <div className="flex md:hidden items-center justify-between gap-2 mb-2">
            <Logo variant="karobaari" />
            <div className="flex items-center gap-2">
              <Link
                href="/real-estate"
                className="flex items-center gap-1 bg-karobaari-darkMaroon text-karobaari-gold px-2.5 py-1.5 rounded text-[11px] font-bold border border-karobaari-gold/30"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Real Estate</span>
              </Link>
              <button
                type="button"
                onClick={() => openCartDrawer()}
                className="relative flex items-center justify-center bg-karobaari-darkMaroon p-2 rounded border border-white/20 cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-karobaari-gold text-karobaari-darkGray font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-karobaari-maroon shadow">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Single Row / Mobile Search Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-6">
            {/* Desktop Logo */}
            <div className="hidden md:block flex-shrink-0">
              <Logo variant="karobaari" />
            </div>

            {/* Live Search Bar */}
            <div ref={searchRef} className="flex-1 w-full max-w-full md:max-w-2xl relative min-w-0">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search products, machinery, properties, courses..."
                  className="w-full min-w-0 pl-3.5 pr-4 py-2 sm:py-2.5 rounded-l-lg bg-white text-karobaari-darkGray text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-karobaari-gold placeholder:text-gray-400 shadow-inner"
                />
                <button
                  type="submit"
                  className="bg-karobaari-gold hover:bg-yellow-500 text-karobaari-darkGray px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-r-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-colors shadow-md flex-shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-karobaari-darkGray" />
                  <span className="hidden sm:inline ml-1">Search</span>
                </button>
              </form>

              {/* LIVE SEARCH DROPDOWN */}
              {isSearchOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 text-karobaari-darkGray p-3.5 sm:p-4 z-50 max-w-full overflow-hidden animate-fadeIn">
                  {searchHistory.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-karobaari-maroon" /> Recent Searches
                        </span>
                        <button onClick={clearHistory} className="text-gray-400 hover:text-red-600 flex items-center gap-0.5 text-[10px]">
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {searchHistory.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleTagClick(item)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-karobaari-maroon hover:text-white rounded-md text-[11px] font-medium transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-karobaari-gold" /> Trending Suggestions
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Sublimation Heat Press",
                        "4 Marla House Shahpur",
                        "Cloth Stand",
                        "DHA Villa",
                        "5 Pcs T-Shirt",
                        "E-Commerce Course",
                      ].map((trend, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTagClick(trend)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-karobaari-gold hover:text-karobaari-darkGray rounded-md text-[11px] font-medium transition-colors"
                        >
                          {trend}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <Link
                href="/real-estate"
                className="flex items-center gap-1.5 bg-karobaari-darkMaroon hover:bg-black/40 text-karobaari-gold font-medium px-3.5 py-2 rounded-lg border border-karobaari-gold/40 text-xs transition-all"
              >
                <Building2 className="w-4 h-4 text-karobaari-gold" />
                <span>Prism Properties</span>
              </Link>

              <button
                type="button"
                onClick={() => openCartDrawer()}
                className="relative flex items-center gap-2 bg-karobaari-darkMaroon hover:bg-black/30 px-3.5 py-2 rounded-lg border border-white/20 transition-all group cursor-pointer"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-white group-hover:text-karobaari-gold transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-karobaari-gold text-karobaari-darkGray font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-karobaari-maroon shadow">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold">Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY & NAVIGATION STRIP (Smooth Horizontal Scroll on Mobile) */}
      <div className="bg-karobaari-offWhite border-b border-gray-200 w-full relative z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 overflow-x-auto md:overflow-visible scrollbar-none [touch-action:pan-x] overscroll-x-contain">
          <div className="flex items-center justify-start gap-4 sm:gap-7 py-2 sm:py-1.5 text-xs font-semibold text-karobaari-darkGray whitespace-nowrap min-w-max">
            <DarazCategoryMenu categories={categories} />

            <Link
              href="/real-estate"
              className="text-karobaari-darkMaroon font-bold flex items-center gap-1.5 hover:text-karobaari-maroon transition-colors shrink-0"
            >
              <Building2 className="w-4 h-4 text-karobaari-gold shrink-0" />
              <span>Real Estate</span>
            </Link>

            <Link
              href="/digital-books"
              className="flex items-center gap-1.5 hover:text-karobaari-maroon transition-colors shrink-0"
            >
              <BookOpen className="w-4 h-4 text-karobaari-maroon shrink-0" />
              <span>E-Books</span>
            </Link>

            <Link
              href="/courses"
              className="flex items-center gap-1.5 hover:text-karobaari-maroon transition-colors shrink-0"
            >
              <GraduationCap className="w-4 h-4 text-purple-700 shrink-0" />
              <span>Courses</span>
            </Link>

            <Link
              href="/shop?flash=true"
              className="flex items-center gap-1.5 text-red-600 font-bold hover:text-red-700 transition-colors shrink-0 pr-3 sm:pr-0"
            >
              <Sparkles className="w-4 h-4 text-red-600 animate-pulse shrink-0" />
              <span>Flash Deals</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}