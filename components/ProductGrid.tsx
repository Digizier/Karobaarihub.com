"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  loading?: boolean;
}

export default function ProductGrid({
  products,
  title,
  subtitle,
  viewAllHref,
  loading = false,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3.5 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
            <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1.5" />
            <div className="h-3.5 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {(title || viewAllHref) && (
        <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-gray-200">
          <div className="min-w-0">
            {title && (
              <h2 className="font-serif font-bold text-base sm:text-2xl text-karobaari-darkGray truncate">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-[11px] sm:text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-[11px] sm:text-xs font-semibold text-karobaari-maroon hover:text-karobaari-darkMaroon flex items-center gap-0.5 flex-shrink-0"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">No products found in this selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3.5 w-full">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}