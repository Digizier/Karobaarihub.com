"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ShoppingCart, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { addToCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  const currentPrice = product.sale_price ?? product.price;
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      product_id: product.id,
      type: "ecommerce",
      title: product.name,
      slug: product.slug,
      price: currentPrice,
      original_price: product.price,
      thumbnail_url: product.thumbnail_url,
      stock_available: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-karobaari-maroon/40 transition-all flex flex-col justify-between group relative w-full min-w-0 h-full">
      <div>
        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute top-1.5 left-1.5 z-10 bg-karobaari-maroon text-white font-extrabold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow">
            -{discountPercent}%
          </div>
        )}

        {/* Product Image */}
        <Link href={`/product/?slug=${product.slug}`} className="block relative aspect-square w-full bg-gray-100 overflow-hidden">
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Trust Badges */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none">
            <span className="bg-emerald-600/90 text-white text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded backdrop-blur-xs">
              Free Delivery
            </span>
            <span className="bg-karobaari-darkMaroon/90 text-karobaari-gold text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded backdrop-blur-xs">
              Voucher Max
            </span>
          </div>
        </Link>

        {/* Product Content */}
        <div className="p-2 sm:p-3">
          <Link href={`/product/?slug=${product.slug}`}>
            <h3 className="text-[11px] sm:text-xs font-medium text-karobaari-darkGray line-clamp-2 h-7 sm:h-8 hover:text-karobaari-maroon leading-tight mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="flex items-baseline gap-1 flex-wrap mt-1">
            <span className="text-xs sm:text-sm font-extrabold text-karobaari-maroon font-sans">
              Rs. {currentPrice.toLocaleString()}
            </span>
            {product.sale_price && (
              <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-gray-500">
            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
              <span>{product.rating.toFixed(1)}</span>
              {product.sales_count > 0 && (
                <span className="text-gray-400 text-[9px] sm:text-[10px]">({product.sales_count})</span>
              )}
            </div>
            {product.location_tag && (
              <div className="flex items-center gap-0.5 text-gray-400 truncate max-w-[65px] sm:max-w-none">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate text-[9px] sm:text-[10px]">{product.location_tag}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="p-2 sm:p-3 pt-0">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
            added
              ? "bg-green-600 text-white"
              : "bg-karobaari-offWhite hover:bg-karobaari-maroon text-karobaari-darkGray hover:text-white border border-gray-200"
          }`}
        >
          {added ? (
            <>
              <Check className="w-3 h-3" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}