"use client";

import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Utensils, MapPin, PhoneCall, ArrowRight } from "lucide-react";
import { Property } from "@/lib/types";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const whatsappMessage = encodeURIComponent(
    `Hello Prism Real Estate, I am interested in: "${property.title}" (${property.price_display}) at ${property.location}.`
  );

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-karobaari-maroon transition-all flex flex-col justify-between group w-full min-w-0">
      <div>
        {/* Property Thumbnail */}
        <div className="relative aspect-[16/10] bg-karobaari-darkGray overflow-hidden w-full">
          <Image
            src={property.thumbnail_url || "/assets/shahpur-house.jpeg"}
            alt={property.title || "Property"}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
            <span className="bg-karobaari-maroon text-white font-serif font-bold text-[9px] sm:text-xs px-2 py-0.5 rounded shadow border border-karobaari-gold/40">
              {property.property_type}
            </span>
            <span className="bg-karobaari-gold text-karobaari-darkGray font-bold text-[9px] sm:text-xs px-2 py-0.5 rounded shadow">
              {property.area_marla} Marla
            </span>
          </div>
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-black/75 backdrop-blur-sm text-white font-medium text-[9px] sm:text-[10px] px-2 py-0.5 rounded border border-white/20">
              {property.status}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-3 sm:p-4">
          <div className="mb-1">
            <span className="text-base sm:text-xl font-serif font-extrabold text-karobaari-maroon block">
              {property.price_display}
            </span>
          </div>

          <Link href={`/real-estate/property/?slug=${property.slug}`}>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-karobaari-darkGray group-hover:text-karobaari-maroon transition-colors line-clamp-2 h-7 sm:h-9 mb-1.5 leading-snug">
              {property.title}
            </h3>
          </Link>

          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mb-2">
            <MapPin className="w-3 h-3 text-karobaari-maroon flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {(property.bedrooms > 0 || property.bathrooms > 0) && (
            <div className="grid grid-cols-3 gap-1 py-1.5 my-1.5 border-y border-gray-100 text-[10px] sm:text-xs text-karobaari-darkGray">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-1 truncate">
                  <Bed className="w-3 h-3 text-karobaari-gold flex-shrink-0" />
                  <span className="truncate">{property.bedrooms} Beds</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-1 truncate">
                  <Bath className="w-3 h-3 text-karobaari-gold flex-shrink-0" />
                  <span className="truncate">{property.bathrooms} Baths</span>
                </div>
              )}
              {property.kitchens > 0 && (
                <div className="flex items-center gap-1 truncate">
                  <Utensils className="w-3 h-3 text-karobaari-gold flex-shrink-0" />
                  <span className="truncate">{property.kitchens} Kit</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 sm:p-4 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/923359939702?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold py-2 rounded-lg transition-colors shadow-xs"
          >
            <PhoneCall className="w-3 h-3" />
            <span>WhatsApp</span>
          </a>
          <Link
            href={`/real-estate/property/${property.slug}`}
            className="flex items-center justify-center gap-1 bg-karobaari-darkMaroon hover:bg-karobaari-maroon text-white text-[11px] sm:text-xs font-bold py-2 rounded-lg transition-colors shadow-xs"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}