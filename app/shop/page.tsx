"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import {
  Filter,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  RotateCcw,
  X,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories, buildCategoryTree, slugify } from "@/lib/db";
import { Product, Category } from "@/lib/types";

const ITEMS_PER_PAGE = 8;

function ShopContent({ categoryParam }: { categoryParam?: string }) {
  const searchParams = useSearchParams();
  const params = useParams();
  const routeCategory = categoryParam || (params?.category as string) || "";
  const initialCategory = routeCategory || searchParams.get("category") || "";
  const initialSearch = searchParams.get("q") || "";
  const initialFlash = searchParams.get("flash") === "true";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [sort, setSort] = useState<"best_match" | "top_sales" | "price_asc" | "price_desc" | "newest">("best_match");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categoryTree = buildCategoryTree(categories.filter((c) => c.is_active));

  const getCategoryPath = (slug: string, cats: Category[]): Category[] => {
    if (!slug) return [];
    const cleanTarget = slug.toLowerCase().trim();
    const target = cats.find((c) => c.slug.toLowerCase().trim() === cleanTarget || slugify(c.name) === cleanTarget);
    if (!target) return [];
    const path: Category[] = [];
    let curr: Category | undefined = target;
    const catMap = new Map(cats.map((c) => [c.id, c]));
    while (curr) {
      path.unshift(curr);
      curr = curr.parent_id ? catMap.get(curr.parent_id) : undefined;
    }
    return path;
  };

  const categoryTrail = getCategoryPath(selectedCategory, categories);

  // Auto-expand tree path for active category
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const cleanTarget = selectedCategory.toLowerCase().trim();
      const target = categories.find((c) => c.slug.toLowerCase().trim() === cleanTarget || slugify(c.name) === cleanTarget);
      if (target) {
        const toExpand: Record<string, boolean> = {};
        let curr: Category | undefined = target;
        const catMap = new Map(categories.map((c) => [c.id, c]));
        while (curr) {
          if (curr.parent_id) {
            toExpand[curr.parent_id] = true;
            curr = catMap.get(curr.parent_id);
          } else {
            curr = undefined;
          }
        }
        setExpandedCategories((prev) => ({ ...prev, ...toExpand }));
      }
    }
  }, [selectedCategory, categories]);

  const loadCategoriesData = () => {
    getCategories().then(setCategories);
  };

  const loadProductsData = () => {
    setLoading(true);
    getProducts({
      categorySlug: selectedCategory || undefined,
      search: initialSearch || undefined,
      flashSaleOnly: initialFlash || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
      limit: 100,
      offset: 0,
    }).then((res) => {
      let filtered = res.products;
      if (minRating > 0) {
        filtered = filtered.filter((p) => p.rating >= minRating);
      }
      setProducts(filtered);
      setTotal(filtered.length);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCategoriesData();
    window.addEventListener("kb_categories_updated", loadCategoriesData);
    window.addEventListener("kb_products_updated", loadProductsData);
    window.addEventListener("storage", () => {
      loadCategoriesData();
      loadProductsData();
    });
    return () => {
      window.removeEventListener("kb_categories_updated", loadCategoriesData);
      window.removeEventListener("kb_products_updated", loadProductsData);
      window.removeEventListener("storage", () => {});
    };
  }, [selectedCategory, initialSearch, initialFlash, minPrice, maxPrice, minRating, sort]);

  useEffect(() => {
    const current = categoryParam || (params?.category as string) || searchParams.get("category") || "";
    setSelectedCategory(current);
  }, [categoryParam, params, searchParams]);

  useEffect(() => {
    setPage(1);
    loadProductsData();
  }, [selectedCategory, initialSearch, initialFlash, minPrice, maxPrice, minRating, sort]);

  const resetFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setSort("best_match");
    setPage(1);
  };

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const activeCategoryTitle = activeCategoryObj?.name || (selectedCategory ? selectedCategory.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "All Marketplace Products");

  return (
    <div className="bg-gray-50 min-h-screen py-3 sm:py-5 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Breadcrumbs with Clickable Trail */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mb-3 flex-wrap">
          <Link href="/" className="hover:text-karobaari-maroon flex-shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <button
            type="button"
            onClick={() => setSelectedCategory("")}
            className={`hover:text-karobaari-maroon truncate cursor-pointer ${!selectedCategory ? "text-karobaari-maroon font-bold" : "text-karobaari-darkGray font-medium"}`}
          >
            Marketplace
          </button>
          {categoryTrail.map((cat, idx) => {
            const isLast = idx === categoryTrail.length - 1 && !initialSearch;
            return (
              <span key={cat.id} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                {isLast ? (
                  <span className="text-karobaari-maroon font-bold truncate">{cat.name}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className="hover:text-karobaari-maroon font-medium truncate cursor-pointer"
                  >
                    {cat.name}
                  </button>
                )}
              </span>
            );
          })}
          {initialSearch && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-karobaari-maroon font-bold truncate">&ldquo;{initialSearch}&rdquo;</span>
            </>
          )}
        </div>

        {/* Header & Sort Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-3 sm:mb-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-base sm:text-xl text-karobaari-darkGray truncate">
              {initialSearch ? `Search: "${initialSearch}"` : activeCategoryTitle}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              <span className="font-bold text-karobaari-maroon">{total}</span> items found
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-karobaari-maroon" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-karobaari-darkGray focus:outline-none focus:ring-1 focus:ring-karobaari-maroon cursor-pointer"
              >
                <option value="best_match">Best Match</option>
                <option value="top_sales">Top Sales</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden md:block bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-5 h-fit sticky top-24">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
              <span className="font-serif font-bold text-sm text-karobaari-darkGray flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-karobaari-maroon" /> Filters
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-gray-500 hover:text-karobaari-maroon flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Categories</h4>
                <span className="text-[10px] text-gray-400 font-medium">{categories.length} total</span>
              </div>
              <div className="space-y-0.5 text-xs text-gray-600 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    selectedCategory === "" ? "bg-karobaari-maroon text-white font-bold shadow-xs" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categoryTree.map((cat) => (
                  <CategoryTreeItem
                    key={cat.id}
                    cat={cat}
                    depth={0}
                    selectedSlug={selectedCategory}
                    expandedMap={expandedCategories}
                    onToggle={toggleCategoryExpand}
                    onSelect={(slug) => setSelectedCategory(slug)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Price (PKR)</h4>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-karobaari-darkGray focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-karobaari-darkGray focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
                />
              </div>
            </div>
          </aside>

          {/* PRODUCT LISTING GRID */}
          <main className="md:col-span-3 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                    <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1.5" />
                    <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center shadow-xs">
                <p className="font-serif font-bold text-base text-karobaari-darkGray mb-1">
                  No products found in {activeCategoryTitle}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Try adjusting your filters or browse all marketplace categories.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-block bg-karobaari-maroon text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-karobaari-darkMaroon transition-colors cursor-pointer"
                >
                  Clear All Filters &amp; View All
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5">
                  {products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* PAGINATION CONTROLS */}
                {Math.ceil(products.length / ITEMS_PER_PAGE) > 1 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-gray-500 font-medium">
                      Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, products.length)} of {products.length} Products
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => {
                          setPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          page === 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        }`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>

                      {Array.from({ length: Math.ceil(products.length / ITEMS_PER_PAGE) }).map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              setPage(pageNum);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              page === pageNum
                                ? "bg-karobaari-maroon text-white shadow-xs"
                                : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        disabled={page === Math.ceil(products.length / ITEMS_PER_PAGE)}
                        onClick={() => {
                          setPage((p) => Math.min(Math.ceil(products.length / ITEMS_PER_PAGE), p + 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          page === Math.ceil(products.length / ITEMS_PER_PAGE)
                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        }`}
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end">
          <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-karobaari-darkGray">Filter Products</span>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-400 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 text-xs text-karobaari-darkGray">
              <div>
                <h4 className="font-bold text-gray-700 mb-2">Select Category</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("");
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg border font-medium truncate cursor-pointer transition-colors ${
                      selectedCategory === ""
                        ? "border-karobaari-maroon bg-red-50 text-karobaari-maroon font-bold shadow-xs"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All Categories
                  </button>
                  {categoryTree.map((cat) => (
                    <CategoryTreeItem
                      key={cat.id}
                      cat={cat}
                      depth={0}
                      selectedSlug={selectedCategory}
                      expandedMap={expandedCategories}
                      onToggle={toggleCategoryExpand}
                      onSelect={(slug) => {
                        setSelectedCategory(slug);
                        setIsMobileFilterOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 mb-2">Price Range (PKR)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-gray-200 grid grid-cols-2 gap-2 bg-gray-50">
              <button type="button" onClick={resetFilters} className="py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold text-xs cursor-pointer">Reset</button>
              <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="py-2 rounded-lg bg-karobaari-maroon text-white font-bold text-xs shadow cursor-pointer">Done ({total} Products)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function CategoryTreeItem({
  cat,
  depth = 0,
  selectedSlug,
  expandedMap,
  onToggle,
  onSelect,
}: {
  cat: Category;
  depth?: number;
  selectedSlug: string;
  expandedMap: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (slug: string) => void;
}) {
  const isSelected = selectedSlug === cat.slug;
  const isExpanded = !!expandedMap[cat.id];
  const hasChildren = (cat.children || []).length > 0;

  return (
    <div className="select-none">
      <div
        className={`group flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer ${
          isSelected
            ? "bg-karobaari-maroon text-white font-bold shadow-xs"
            : "text-gray-700 hover:bg-gray-100 hover:text-karobaari-maroon"
        }`}
        style={{ paddingLeft: `${Math.max(8, depth * 12 + 8)}px` }}
      >
        <button
          type="button"
          onClick={() => onSelect(cat.slug)}
          className="flex items-center gap-1.5 flex-1 text-left truncate cursor-pointer"
        >
          {depth > 0 && (
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isSelected ? "bg-karobaari-gold" : "bg-gray-300 group-hover:bg-karobaari-maroon"
              }`}
            />
          )}
          <span className="truncate">{cat.name}</span>
        </button>

        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(cat.id);
            }}
            className={`p-1 rounded transition-transform ${
              isSelected ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-gray-700"
            }`}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-0.5 mt-0.5 border-l border-gray-100 ml-3">
          {cat.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              cat={child}
              depth={depth + 1}
              selectedSlug={selectedSlug}
              expandedMap={expandedMap}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
