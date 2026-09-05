"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import Logo from "./Logo";
import { getSiteSettings } from "@/lib/db";
import { initialSiteSettings } from "@/lib/mockData";
import { SiteSettings } from "@/lib/types";

export default function Footer() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);

  const loadSettings = () => {
    getSiteSettings().then((s) => {
      if (s) setSiteSettings(s);
    });
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener("kb_settings_updated", loadSettings);
    return () => window.removeEventListener("kb_settings_updated", loadSettings);
  }, []);

  return (
    <footer className="bg-karobaari-darkGray text-gray-300 pt-8 sm:pt-12 pb-24 md:pb-12 border-t-4 border-karobaari-maroon w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 pb-8 sm:pb-12 border-b border-gray-700">
          {/* 1. Brand & Contact */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Logo variant="karobaari" className="mb-3" />
            <p className="text-xs text-gray-400 leading-relaxed mb-4 max-w-sm">
              Karobaari Hub &amp; Co. is Pakistan&apos;s premier multi-niche commerce and investment portal, featuring marketplace products, machinery, Prism Real Estate properties, online courses, and digital e-books.
            </p>
            <div className="space-y-2 text-xs text-gray-300">
              <a
                href={`tel:${siteSettings.hotline?.replace(/\s+/g, "") || "+923359939702"}`}
                className="flex items-center gap-2 hover:text-karobaari-gold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-karobaari-gold flex-shrink-0" />
                <span>{siteSettings.hotline || "+92 335 9939 702"}</span>
              </a>
              <a
                href={`mailto:${siteSettings.email || "karobaarihub@gmail.com"}`}
                className="flex items-center gap-2 hover:text-karobaari-gold transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-karobaari-gold flex-shrink-0" />
                <span>{siteSettings.email || "karobaarihub@gmail.com"}</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-karobaari-gold flex-shrink-0 mt-0.5" />
                <span>{siteSettings.address || "Main Stop Shahpur, Adyala Road, Rawalpindi / Islamabad, Pakistan"}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 mt-4">
              <a
                href="https://www.facebook.com/prismrealestate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 hover:bg-karobaari-maroon flex items-center justify-center text-white transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.instagram.com/prismrealestate4"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 hover:bg-karobaari-maroon flex items-center justify-center text-white transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.youtube.com/@PrismRealEstate-v3q"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 hover:bg-karobaari-maroon flex items-center justify-center text-white transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.tiktok.com/@prismrealestate.pk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 hover:bg-karobaari-maroon flex items-center justify-center text-white font-bold text-[10px] transition-colors"
              >
                TK
              </a>
            </div>
          </div>

          {/* 2. Marketplace Categories */}
          <div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-white uppercase tracking-wider mb-2.5 sm:mb-4 border-b border-karobaari-gold pb-1 inline-block">
              Marketplace
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li><Link href="/shop/mobiles-tablets/" className="hover:text-karobaari-gold">Mobiles &amp; Tablets</Link></li>
              <li><Link href="/shop/electronic-accessories/" className="hover:text-karobaari-gold">Electronics</Link></li>
              <li><Link href="/shop/home-lifestyle/" className="hover:text-karobaari-gold">Home &amp; Lifestyle</Link></li>
              <li><Link href="/shop/mens-fashion/" className="hover:text-karobaari-gold">Men&apos;s Fashion</Link></li>
              <li><Link href="/shop/womens-fashion/" className="hover:text-karobaari-gold">Women&apos;s Fashion</Link></li>
              <li><Link href="/shop/" className="text-karobaari-gold font-semibold hover:underline">All Products &rarr;</Link></li>
            </ul>
          </div>

          {/* 3. Prism Real Estate & Digital */}
          <div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-white uppercase tracking-wider mb-2.5 sm:mb-4 border-b border-karobaari-gold pb-1 inline-block">
              Real Estate &amp; Learning
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li><Link href="/real-estate" className="hover:text-karobaari-gold">Houses For Sale</Link></li>
              <li><Link href="/real-estate?type=Plot" className="hover:text-karobaari-gold">Residential &amp; Plots</Link></li>
              <li><Link href="/real-estate/services" className="hover:text-karobaari-gold">Property Consultancy</Link></li>
              <li><Link href="/real-estate/booking-policy" className="hover:text-karobaari-gold text-amber-200/90 font-medium">Bayana &amp; Booking Policy</Link></li>
              <li><Link href="/digital-books" className="hover:text-karobaari-gold">Digital E-Books</Link></li>
              <li><Link href="/courses" className="hover:text-karobaari-gold">Video Courses</Link></li>
              <li><Link href="/track-order" className="hover:text-karobaari-gold">Track Order</Link></li>
            </ul>
          </div>

          {/* 4. Customer Policies */}
          <div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-white uppercase tracking-wider mb-2.5 sm:mb-4 border-b border-karobaari-gold pb-1 inline-block">
              Customer Care
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li><Link href="/about" className="hover:text-karobaari-gold">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-karobaari-gold">Contact Support</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-karobaari-gold">Shipping Policy</Link></li>
              <li><Link href="/refund-return-policy" className="hover:text-karobaari-gold">Return &amp; Refund</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-karobaari-gold">Privacy Policy</Link></li>
              <li><Link href="/reseller-policy" className="hover:text-karobaari-gold text-amber-200/90 font-medium">Reseller Policy</Link></li>
              <li><Link href="/pricing-policy" className="hover:text-karobaari-gold text-amber-200/90 font-medium">Transparent Pricing Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-karobaari-gold">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>&copy; {new Date().getFullYear()} {siteSettings.site_name || "Karobaari Hub & Co."}. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Rawalpindi / Islamabad / Pakistan</span>
            <span className="text-gray-600">|</span>
            <span className="text-karobaari-gold font-semibold">100% Verified Listings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
