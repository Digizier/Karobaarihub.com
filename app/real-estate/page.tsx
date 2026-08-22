"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { getProperties } from "@/lib/db";
import { Property } from "@/lib/types";
import { initialProperties } from "@/lib/mockData";

export default function RealEstatePage() {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(true);

  const loadPropertiesData = () => {
    getProperties({ limit: 24 }).then((res) => {
      if (res && res.properties && res.properties.length > 0) {
        setProperties(res.properties);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadPropertiesData();
    window.addEventListener("kb_properties_updated", loadPropertiesData);
    window.addEventListener("focus", loadPropertiesData);
    return () => {
      window.removeEventListener("kb_properties_updated", loadPropertiesData);
      window.removeEventListener("focus", loadPropertiesData);
    };
  }, []);

  const featuredDeal = properties.find((p) => p.is_featured) || properties[0] || initialProperties[0];

  return (
    <div className="bg-gray-50 min-h-screen w-full overflow-hidden">
      {/* 1. HERO PRISM REAL ESTATE */}
      <section className="relative bg-gradient-to-r from-black via-karobaari-darkGray to-karobaari-darkMaroon text-white py-8 sm:py-14 px-3 sm:px-6 border-b-4 border-karobaari-gold">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl w-full">
            <div className="inline-flex items-center gap-1.5 bg-karobaari-gold/20 text-karobaari-gold text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-karobaari-gold/40 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Prism Real Estate &amp; Investment</span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-5xl text-white leading-tight mb-2 sm:mb-4">
              Premium Houses, Plots &amp; Commercial Real Estate
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4 sm:mb-6">
              Verified houses, commercial plazas, and investment plots across Shahpur, Adyala Road, Bahria Town, DHA Phase 2, Askari 14, and Islamabad.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href="https://wa.me/923359939702?text=Hello%20Prism%20Real%20Estate,%20I%20want%20to%20inquire%20about%20properties."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>WhatsApp Advisor (+92 335 9939 702)</span>
              </a>
              <Link
                href="/real-estate/properties"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-white/20 transition-colors text-center"
              >
                Browse All Listings
              </Link>
            </div>
          </div>

          {/* Featured House Showcase Badge */}
          {featuredDeal && (
            <div className="bg-white/10 backdrop-blur-md border border-karobaari-gold/40 rounded-2xl p-4 sm:p-6 text-white max-w-sm w-full shadow-xl">
              <span className="text-[9px] font-extrabold uppercase bg-karobaari-gold text-karobaari-darkGray px-2 py-0.5 rounded tracking-wider">
                Hot Deal of the Month
              </span>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white mt-1.5 line-clamp-1">
                {featuredDeal.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-300 mt-1 line-clamp-2">
                {featuredDeal.location}. {featuredDeal.bedrooms > 0 ? `${featuredDeal.bedrooms} Beds, ` : ""}{featuredDeal.area_marla} Marla.
              </p>
              <div className="text-xl sm:text-2xl font-serif font-extrabold text-karobaari-gold mt-2.5">
                {featuredDeal.price_display}
              </div>
              <Link
                href={`/real-estate/property/?slug=${featuredDeal.slug}`}
                className="mt-3 w-full bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <span>View Property Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 2. LOCATIONS STRIP */}
      <section className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
            Top Investment Societies Covered:
          </span>
          <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
            {[
              "Main Stop Shahpur",
              "Adyala Road Rawalpindi",
              "DHA Islamabad",
              "Bahria Town",
              "Askari 14",
              "Lalazar",
              "Gulshanabad",
              "Samarzar",
              "Snober City",
              "Khawaja Corp",
              "Garden Villas",
            ].map((loc, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-karobaari-darkGray px-2.5 py-1 rounded-md font-medium border border-gray-200"
              >
                {loc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROPERTIES LISTING */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-2xl text-karobaari-darkGray">
              Featured Properties For Sale
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500">Houses, Plots, and Commercial Units in Rawalpindi / Islamabad</p>
          </div>
          <Link
            href="/real-estate/properties"
            className="text-[11px] sm:text-xs font-semibold text-karobaari-maroon hover:underline flex items-center gap-0.5"
          >
            <span>All Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
