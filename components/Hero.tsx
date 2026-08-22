"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  BadgePercent,
  Coins,
  Building2,
  BookOpen,
  GraduationCap,
  Sparkles,
  Ticket,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Banner, Voucher } from "@/lib/types";

interface HeroProps {
  banners: Banner[];
  vouchers: Voucher[];
}

export default function Hero({ banners, vouchers }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [collectedVouchers, setCollectedVouchers] = useState<string[]>([]);
  const [allCollectedNotice, setAllCollectedNotice] = useState(false);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handleCollectAll = () => {
    const codes = vouchers.map((v) => v.code);
    setCollectedVouchers(codes);
    setAllCollectedNotice(true);
    setTimeout(() => setAllCollectedNotice(false), 3500);
  };

  return (
    <section className="bg-gray-50 pt-2 sm:pt-3 pb-4 sm:pb-6 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* 1. HERO BANNER CAROUSEL WITH SLIDE COUNTER (e.g. 2/15) */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg aspect-[16/9] sm:aspect-[24/8] min-h-[170px] max-h-[380px] bg-karobaari-darkGray group w-full">
          {banners.length === 0 ? (
            <div className="absolute inset-0 bg-gradient-to-r from-black via-karobaari-darkGray to-karobaari-darkMaroon flex items-center p-4 sm:p-8 animate-pulse">
              <div className="space-y-2.5 max-w-md">
                <div className="h-4 w-24 bg-white/20 rounded-full" />
                <div className="h-7 sm:h-10 w-3/4 bg-white/20 rounded-xl" />
                <div className="h-3 sm:h-4 w-1/2 bg-white/20 rounded-lg" />
              </div>
            </div>
          ) : (
            banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={banner.image_url || "/assets/ecommerce-banner-1.jpeg"}
                alt={banner.title || "Promotion"}
                fill
                priority={index === 0}
                unoptimized
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex items-center">
                <div className="max-w-xl p-3.5 sm:p-8 md:p-12 text-white">
                  <span className="inline-block bg-karobaari-gold text-karobaari-darkGray text-[9px] sm:text-xs font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full mb-1 sm:mb-2 tracking-wider shadow">
                    Featured Deal
                  </span>
                  <h1 className="font-serif font-bold text-sm sm:text-2xl md:text-4xl text-white leading-tight mb-1 sm:mb-2 drop-shadow line-clamp-2">
                    {banner.title}
                  </h1>
                  <p className="text-[11px] sm:text-sm text-gray-200 line-clamp-1 sm:line-clamp-2 mb-2.5 sm:mb-4 max-w-md drop-shadow">
                    {banner.subtitle}
                  </p>
                  <Link
                    href={banner.link_url}
                    className="inline-flex items-center gap-1.5 bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white text-[11px] sm:text-sm font-semibold px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg border border-karobaari-gold/40 shadow transition-transform active:scale-95"
                  >
                    <span>{banner.cta_text || "Shop Now"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )))}

          {/* Carousel Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="hidden sm:group-hover:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-karobaari-maroon text-white items-center justify-center transition-all shadow"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="hidden sm:group-hover:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-karobaari-maroon text-white items-center justify-center transition-all shadow"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* SLIDE COUNTER BADGE */}
          <div className="absolute right-2.5 bottom-2.5 sm:right-4 sm:bottom-4 z-20 bg-black/65 backdrop-blur-sm text-white text-[10px] sm:text-xs font-mono px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/20 shadow flex items-center gap-1">
            <span className="text-karobaari-gold font-bold">{currentSlide + 1}</span>
            <span className="text-gray-400">/</span>
            <span>{banners.length}</span>
          </div>
        </div>

        {/* 2. TRUST BADGES BAR */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 mt-2.5 p-2 sm:p-3 grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-karobaari-darkGray">
          <div className="flex items-center gap-1.5 px-1 py-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0" />
            <span className="truncate">Safe &amp; Verified Payment</span>
          </div>
          <div className="flex items-center gap-1.5 px-1 py-0.5">
            <Truck className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0" />
            <span className="truncate">Fast Delivery Across PK</span>
          </div>
          <div className="flex items-center gap-1.5 px-1 py-0.5">
            <RotateCcw className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0" />
            <span className="truncate">7-Day Easy Returns</span>
          </div>
          <div className="flex items-center gap-1.5 px-1 py-0.5">
            <Sparkles className="w-3.5 h-3.5 text-karobaari-gold flex-shrink-0" />
            <span className="truncate">100% Genuine Quality</span>
          </div>
        </div>

        {/* 3. QUICK 6-GRID */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mt-2.5">
          {[
            { title: "Coins 70% Off", href: "/shop?discount=coins", icon: Coins, bg: "bg-amber-500" },
            { title: "Sasti Choice", href: "/shop", icon: BadgePercent, bg: "bg-red-600" },
            { title: "Real Estate", href: "/real-estate", icon: Building2, bg: "bg-karobaari-maroon" },
            { title: "Courses", href: "/courses", icon: GraduationCap, bg: "bg-purple-600" },
            { title: "E-Books", href: "/digital-books", icon: BookOpen, bg: "bg-emerald-600" },
            { title: "Flash Deals", href: "/shop?flash=true", icon: Sparkles, bg: "bg-yellow-500" },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Link
                key={idx}
                href={feat.href}
                className="bg-white rounded-xl p-2 sm:p-3 border border-gray-200 shadow-xs hover:shadow-sm hover:border-karobaari-maroon transition-all text-center flex flex-col items-center group"
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${feat.bg} text-white flex items-center justify-center mb-1 shadow group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-karobaari-darkGray line-clamp-1 leading-snug">
                  {feat.title}
                </span>
              </Link>
            );
          })}
        </div>

        {/* 4. VOUCHER CLAIM BAR */}
        {vouchers.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 rounded-xl border border-amber-200 p-2.5 sm:p-4 mt-2.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-karobaari-maroon text-white flex items-center justify-center flex-shrink-0 shadow">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-karobaari-gold" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-karobaari-darkMaroon truncate">
                  Claim Vouchers to Save More!
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                  Collect free shipping and discount coupons for checkout.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
                {vouchers.slice(0, 2).map((v) => {
                  const isClaimed = collectedVouchers.includes(v.code);
                  return (
                    <div
                      key={v.id}
                      className="border border-dashed border-red-300 bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-xs text-red-700 font-bold flex items-center gap-1 shadow-xs whitespace-nowrap"
                    >
                      <span className="truncate">{v.title}</span>
                      {isClaimed && <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleCollectAll}
                className="bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-[11px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-karobaari-gold/40 shadow transition-all active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                {allCollectedNotice ? "Collected!" : "Collect All"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}