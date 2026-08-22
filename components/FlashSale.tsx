"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";

interface FlashSaleProps {
  products: Product[];
}

export default function FlashSale({ products }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 48, seconds: 58 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format2 = (num: number) => String(num).padStart(2, "0");

  if (!products || products.length === 0) return null;

  return (
    <section className="py-4 sm:py-6 bg-white border-y border-gray-200 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Flash Sale Header with Live Countdown */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 text-red-600 font-serif font-black text-base sm:text-xl md:text-2xl tracking-tight">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-red-600 text-red-600 animate-bounce" />
              <span>Flash Sale</span>
            </div>
            {/* Live Countdown Timer Badges */}
            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-mono font-bold">
              <span className="bg-karobaari-maroon text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-xs">
                {format2(timeLeft.hours)}
              </span>
              <span className="text-karobaari-maroon font-bold">:</span>
              <span className="bg-karobaari-maroon text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-xs">
                {format2(timeLeft.minutes)}
              </span>
              <span className="text-karobaari-maroon font-bold">:</span>
              <span className="bg-karobaari-maroon text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-xs">
                {format2(timeLeft.seconds)}
              </span>
            </div>
          </div>

          <Link
            href="/shop?flash=true"
            className="text-[11px] sm:text-xs font-semibold text-karobaari-maroon hover:text-karobaari-darkMaroon flex items-center gap-0.5 flex-shrink-0"
          >
            <span>Shop More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Flash Sale Products Grid (2 on mobile, 3-6 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {products.slice(0, 6).map((product) => {
            const currentPrice = product.sale_price ?? product.price;
            const discountPercent = product.sale_price
              ? Math.round(((product.price - product.sale_price) / product.price) * 100)
              : null;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group relative w-full min-w-0"
              >
                {/* Discount Badge */}
                {discountPercent && (
                  <div className="absolute top-1.5 left-1.5 z-10 bg-red-600 text-white font-extrabold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow">
                    -{discountPercent}%
                  </div>
                )}

                <Link href={`/product/?slug=${product.slug}`} className="block relative aspect-square w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={product.thumbnail_url || "/assets/cloth-stand-1.jpeg"}
                    alt={product.name || "Product"}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between">
                  <Link href={`/product/?slug=${product.slug}`}>
                    <h4 className="text-[11px] sm:text-xs font-medium text-karobaari-darkGray line-clamp-2 h-7 sm:h-8 hover:text-karobaari-maroon leading-tight mb-1">
                      {product.name}
                    </h4>
                  </Link>

                  <div className="mt-1">
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-karobaari-maroon font-sans">
                        Rs. {currentPrice.toLocaleString()}
                      </span>
                      {product.sale_price && (
                        <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                          Rs. {product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Stock Progress */}
                    <div className="mt-1.5">
                      <div className="w-full bg-gray-200 h-1 sm:h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(25, (product.stock / 60) * 100))}%` }}
                        />
                      </div>
                      <span className="text-[8px] sm:text-[9px] text-red-600 font-semibold mt-0.5 block truncate">
                        {product.stock < 15 ? "Almost sold out!" : `${product.stock} items left`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}