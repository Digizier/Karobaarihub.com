"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Menu, X, Layers, ArrowRight } from "lucide-react";
import { Category } from "@/lib/types";
import { buildCategoryTree } from "@/lib/db";

interface DarazCategoryMenuProps {
  categories: Category[];
}

export default function DarazCategoryMenu({ categories }: DarazCategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});

  const menuRef = useRef<HTMLDivElement>(null);
  const tree = buildCategoryTree(categories.filter((c) => c.is_active));

  // Initialize active root
  useEffect(() => {
    if (tree.length > 0 && !activeRootId) {
      setActiveRootId(tree[0].id);
    }
  }, [tree, activeRootId]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeRoot = tree.find((c) => c.id === activeRootId) || tree[0];
  const activeSubCategories = activeRoot?.children || [];

  const toggleMobileExpand = (id: string) => {
    setMobileExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left shrink-0">
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-karobaari-maroon font-extrabold hover:text-karobaari-darkMaroon transition-colors py-1 px-2.5 rounded-lg hover:bg-karobaari-maroon/10 cursor-pointer text-xs shrink-0 whitespace-nowrap"
        aria-expanded={isOpen}
      >
        <Menu className="w-4 h-4 text-karobaari-maroon" />
        <span>All Categories</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-karobaari-maroon" : "text-gray-400"}`} />
      </button>

      {/* DESKTOP MULTI-LEVEL FLYOUT (Daraz Style - Compact & Balanced) */}
      {isOpen && (
        <div
          onMouseLeave={() => setIsOpen(false)}
          className="hidden md:flex absolute top-full left-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden w-[620px] lg:w-[680px] h-[400px] animate-fadeIn"
        >
          {/* COLUMN 1: MAIN CATEGORIES */}
          <div className="w-56 bg-gray-50/90 border-r border-gray-200 overflow-y-auto p-2 scrollbar-thin">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Categories</span>
              <span className="text-karobaari-maroon font-mono font-bold">{tree.length}</span>
            </div>
            <div className="space-y-0.5">
              {tree.map((cat) => {
                const isActive = cat.id === activeRoot?.id;
                const hasChildren = (cat.children || []).length > 0;
                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => {
                      setActiveRootId(cat.id);
                    }}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-karobaari-maroon text-white shadow-xs"
                        : "text-gray-700 hover:bg-gray-200/70 hover:text-karobaari-maroon"
                    }`}
                  >
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-1.5 flex-1 truncate"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-karobaari-gold" : "bg-gray-300 group-hover:bg-karobaari-maroon"}`} />
                      <span className="truncate">{cat.name}</span>
                    </Link>
                    {hasChildren && (
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? "text-karobaari-gold translate-x-0.5" : "text-gray-400"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: SUBCATEGORIES & CONTENT (No dead space) */}
          <div className="flex-1 bg-white overflow-y-auto p-4 scrollbar-thin flex flex-col justify-between">
            {activeRoot ? (
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  {/* Header for current selected main category */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-karobaari-maroon shrink-0" />
                      <h3 className="font-serif font-bold text-sm text-gray-900 truncate">
                        {activeRoot.name}
                      </h3>
                    </div>
                    <Link
                      href={`/shop?category=${activeRoot.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] font-bold text-karobaari-maroon hover:text-karobaari-darkMaroon flex items-center gap-1 shrink-0"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Subcategories Grid */}
                  {activeSubCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeSubCategories.map((sub) => {
                        return (
                          <div key={sub.id} className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-200/80 hover:border-karobaari-maroon/30 transition-all space-y-1.5">
                            {/* Subcategory Root Title */}
                            <Link
                              href={`/shop?category=${sub.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="font-bold text-xs text-karobaari-darkGray hover:text-karobaari-maroon flex items-center justify-between group"
                            >
                              <span className="group-hover:translate-x-0.5 transition-transform truncate">{sub.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-karobaari-gold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>

                            {/* Recursive Sub-levels */}
                            {(sub.children && sub.children.length > 0) ? (
                              <div className="space-y-1 pl-1.5 border-l-2 border-karobaari-maroon/30">
                                {sub.children.map((lvl2) => (
                                  <div key={lvl2.id} className="space-y-0.5">
                                    <Link
                                      href={`/shop?category=${lvl2.slug}`}
                                      onClick={() => setIsOpen(false)}
                                      className="text-[11px] font-medium text-gray-600 hover:text-karobaari-maroon block transition-colors truncate"
                                    >
                                      &bull; {lvl2.name}
                                    </Link>

                                    {/* Level 3 (Sub-sub-sub categories) */}
                                    {(lvl2.children && lvl2.children.length > 0) && (
                                      <div className="pl-2 space-y-0.5">
                                        {lvl2.children.map((lvl3) => (
                                          <div key={lvl3.id} className="space-y-0.5">
                                            <Link
                                              href={`/shop?category=${lvl3.slug}`}
                                              onClick={() => setIsOpen(false)}
                                              className="text-[10px] text-gray-500 hover:text-karobaari-maroon block truncate"
                                            >
                                              - {lvl3.name}
                                            </Link>
                                            {/* Level 4 if any */}
                                            {(lvl3.children && lvl3.children.length > 0) && (
                                              <div className="pl-1.5 space-y-0.5">
                                                {lvl3.children.map((lvl4) => (
                                                  <Link
                                                    key={lvl4.id}
                                                    href={`/shop?category=${lvl4.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="text-[9px] text-gray-400 hover:text-karobaari-maroon block truncate italic"
                                                  >
                                                    ~ {lvl4.name}
                                                  </Link>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-400 pl-1 italic">
                                Direct category items
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-gray-400 text-xs">
                      <p className="font-semibold text-gray-600">All products available directly in this category.</p>
                    </div>
                  )}
                </div>

                {/* Sleek Bottom Promo Banner (Fills empty area with high-conversion content) */}
                <div className="pt-2 mt-2">
                  <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-karobaari-darkMaroon text-white p-3 rounded-xl border border-karobaari-gold/30 flex items-center justify-between gap-2 shadow-xs">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-karobaari-gold tracking-wider block">Featured Collection</span>
                      <p className="font-serif font-bold text-xs text-white truncate">Explore {activeRoot.name}</p>
                      <p className="text-[10px] text-gray-300 truncate">100% Genuine • Fast Nationwide Delivery</p>
                    </div>
                    <Link
                      href={`/shop?category=${activeRoot.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="bg-karobaari-gold text-gray-950 font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow hover:bg-yellow-400 transition-colors shrink-0 flex items-center gap-1"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MOBILE ACCORDION DRAWER OVERLAY (Clean, Modern & Readable) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-start">
          <div className="bg-white w-4/5 max-w-sm h-full overflow-y-auto p-4 flex flex-col shadow-2xl animate-fadeIn">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-karobaari-maroon" />
                <span className="font-serif font-bold text-sm text-gray-900">All Categories</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Categories Accordion (Clean hierarchy without yellow brackets) */}
            <div className="space-y-1.5 flex-1">
              {tree.map((cat) => {
                return (
                  <MobileCategoryNode
                    key={cat.id}
                    cat={cat}
                    depth={0}
                    expanded={mobileExpanded}
                    onToggle={toggleMobileExpand}
                    onSelect={() => setIsOpen(false)}
                  />
                );
              })}
            </div>

            {/* View All Shop Link */}
            <div className="pt-3 border-t border-gray-200 mt-3">
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="w-full bg-karobaari-maroon text-white font-bold text-xs py-2.5 rounded-xl shadow text-center block"
              >
                Browse Full Catalog
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileCategoryNode({
  cat,
  depth = 0,
  expanded,
  onToggle,
  onSelect,
}: {
  cat: Category;
  depth?: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: () => void;
}) {
  const isExpanded = !!expanded[cat.id];
  const hasChildren = (cat.children || []).length > 0;

  // Level 0: Main Category Card
  if (depth === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs mb-1.5 transition-all">
        <div className="flex items-center justify-between p-2.5 hover:bg-gray-50/80 transition-colors">
          <Link
            href={`/shop?category=${cat.slug}`}
            onClick={onSelect}
            className="font-bold text-xs text-gray-800 hover:text-karobaari-maroon flex-1 truncate"
          >
            {cat.name}
          </Link>
          {hasChildren && (
            <button
              type="button"
              onClick={() => onToggle(cat.id)}
              className="p-1 rounded-md text-gray-400 hover:text-karobaari-maroon hover:bg-gray-100 transition-colors"
              aria-label="Toggle category"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180 text-karobaari-maroon" : ""
                }`}
              />
            </button>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="bg-gray-50/90 p-2 border-t border-gray-100 space-y-1.5">
            {cat.children!.map((child) => (
              <MobileCategoryNode
                key={child.id}
                cat={child}
                depth={1}
                expanded={expanded}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 1: Subcategory Card (e.g. samsung)
  if (depth === 1) {
    return (
      <div className="bg-white rounded-lg border border-gray-200/90 overflow-hidden shadow-2xs">
        <div className="flex items-center justify-between p-2 hover:bg-red-50/30 transition-colors">
          <Link
            href={`/shop?category=${cat.slug}`}
            onClick={onSelect}
            className="font-semibold text-[11px] text-gray-800 hover:text-karobaari-maroon flex-1 truncate flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-karobaari-maroon shrink-0" />
            <span>{cat.name}</span>
          </Link>
          {hasChildren && (
            <button
              type="button"
              onClick={() => onToggle(cat.id)}
              className="p-1 text-gray-400 hover:text-karobaari-maroon"
              aria-label="Toggle subcategory"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isExpanded ? "rotate-180 text-karobaari-maroon" : ""
                }`}
              />
            </button>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="pl-3 pr-2 pb-2 pt-1 border-t border-gray-100 space-y-1 bg-gray-50/50">
            {cat.children!.map((child) => (
              <MobileCategoryNode
                key={child.id}
                cat={child}
                depth={2}
                expanded={expanded}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 2 & 3+: Sub-subcategories (e.g. note 24, nt)
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-gray-100 transition-colors">
        <Link
          href={`/shop?category=${cat.slug}`}
          onClick={onSelect}
          className={`hover:text-karobaari-maroon flex-1 truncate flex items-center gap-1.5 ${
            depth === 2
              ? "text-[11px] font-medium text-gray-700"
              : "text-[10px] text-gray-500 italic pl-2"
          }`}
        >
          <span className="text-gray-400 text-[10px]">{depth === 2 ? "›" : "-"}</span>
          <span className="truncate">{cat.name}</span>
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(cat.id)}
            className="p-0.5 text-gray-400 hover:text-karobaari-maroon"
            aria-label="Toggle child"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${
                isExpanded ? "rotate-180 text-karobaari-maroon" : ""
              }`}
            />
          </button>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="pl-3 space-y-0.5 border-l border-gray-200 ml-1">
          {cat.children!.map((child) => (
            <MobileCategoryNode
              key={child.id}
              cat={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
