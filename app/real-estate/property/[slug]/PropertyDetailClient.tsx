"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import {
  MapPin,
  Bed,
  Bath,
  Utensils,
  PhoneCall,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Send,
  Building2,
} from "lucide-react";
import { Property } from "@/lib/types";
import { createPropertyInquiry, getPropertyBySlug } from "@/lib/db";

interface PropertyDetailClientProps {
  property?: Property | null;
  slug?: string;
}

export default function PropertyDetailClient({ property: initialProperty, slug: propSlug }: PropertyDetailClientProps) {
  const searchParams = useSearchParams();
  const params = useParams();
  const activeSlug = propSlug || (params?.slug as string) || searchParams?.get("slug") || "";

  const [property, setProperty] = useState<Property | null>(initialProperty || null);
  const [loadingProp, setLoadingProp] = useState(!initialProperty);
  const [selectedImg, setSelectedImg] = useState(initialProperty?.thumbnail_url || "/assets/shahpur-house.jpeg");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialProperty && (!activeSlug || initialProperty.slug === activeSlug)) {
      setProperty(initialProperty);
      setSelectedImg(initialProperty.thumbnail_url);
      setLoadingProp(false);
      return;
    }
    if (activeSlug) {
      setLoadingProp(true);
      getPropertyBySlug(activeSlug).then((res) => {
        setProperty(res);
        if (res) setSelectedImg(res.thumbnail_url);
        setLoadingProp(false);
      });
    }
  }, [activeSlug, initialProperty]);

  if (loadingProp) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-karobaari-maroon border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="font-serif font-bold text-lg text-gray-900 mb-2">Property Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-4">
          The requested real estate listing could not be located in our portfolio or has been updated.
        </p>
        <Link
          href="/real-estate/properties"
          className="bg-karobaari-maroon text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-karobaari-darkMaroon transition-colors"
        >
          Browse All Properties
        </Link>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Prism Real Estate, I want to book an on-site visit for: "${property.title}" (${property.price_display}) at ${property.location}.`
  );

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    await createPropertyInquiry({
      property_id: property.id,
      property_title: property.title,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      preferred_visit_date: visitDate || undefined,
      message: message.trim() || undefined,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-3 sm:py-6 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mb-3 truncate">
          <Link href="/" className="hover:text-karobaari-maroon flex-shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <Link href="/real-estate" className="hover:text-karobaari-maroon flex-shrink-0">Prism Real Estate</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-karobaari-darkGray font-medium truncate">{property.title}</span>
        </div>

        {/* 1. PROPERTY HEADER & GALLERY */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3.5 sm:p-6 shadow-xs mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="bg-karobaari-maroon text-white font-serif font-bold text-[9px] sm:text-xs px-2 py-0.5 rounded">
                  {property.property_type}
                </span>
                <span className="bg-karobaari-gold text-karobaari-darkGray font-bold text-[9px] sm:text-xs px-2 py-0.5 rounded">
                  {property.area_marla} Marla
                </span>
                <span className="bg-gray-100 text-gray-700 text-[9px] sm:text-xs px-2 py-0.5 rounded border border-gray-200">
                  Status: {property.status}
                </span>
              </div>
              <h1 className="font-serif font-bold text-base sm:text-2xl md:text-3xl text-karobaari-darkGray">
                {property.title}
              </h1>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0" />
                <span className="truncate">{property.location}</span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[10px] text-gray-400 block">Demand Price</span>
              <span className="font-serif font-extrabold text-xl sm:text-3xl text-karobaari-maroon">
                {property.price_display}
              </span>
            </div>
          </div>

          {/* Main Image & Thumbs */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-8 space-y-2">
              <div className="relative aspect-[16/10] bg-karobaari-darkGray rounded-xl overflow-hidden shadow-inner border border-gray-200 w-full">
                <Image src={selectedImg || "/assets/shahpur-house.jpeg"} alt={property.title || "Property"} fill unoptimized className="object-cover" />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedImg(property.thumbnail_url || "/assets/shahpur-house.jpeg")}
                  className={`relative w-16 h-11 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    selectedImg === property.thumbnail_url ? "border-karobaari-maroon" : "border-gray-200"
                  }`}
                >
                  <Image src={property.thumbnail_url || "/assets/shahpur-house.jpeg"} alt="Thumb" fill unoptimized className="object-cover" />
                </button>
                {property.images?.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImg(img.public_url)}
                    className={`relative w-16 h-11 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                      selectedImg === img.public_url ? "border-karobaari-maroon" : "border-gray-200"
                    }`}
                  >
                    <Image src={img.public_url || "/assets/shahpur-house.jpeg"} alt="Thumb" fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="lg:col-span-4 bg-gray-50 rounded-xl p-3.5 sm:p-5 border border-gray-200 flex flex-col justify-between text-xs">
              <div className="space-y-2.5">
                <h3 className="font-serif font-bold text-xs sm:text-sm text-karobaari-darkGray border-b border-gray-200 pb-1.5">
                  Property Overview
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-gray-400 block text-[10px]">Area</span>
                    <span className="font-bold text-karobaari-darkGray text-xs sm:text-sm">{property.area_marla} Marla</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-gray-400 block text-[10px]">Bedrooms</span>
                    <span className="font-bold text-karobaari-darkGray text-xs sm:text-sm">{property.bedrooms} Beds</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-gray-400 block text-[10px]">Bathrooms</span>
                    <span className="font-bold text-karobaari-darkGray text-xs sm:text-sm">{property.bathrooms} Baths</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-gray-400 block text-[10px]">Kitchens</span>
                    <span className="font-bold text-karobaari-darkGray text-xs sm:text-sm">{property.kitchens} Fitted</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                <a
                  href={`https://wa.me/923359939702?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href="tel:+923359939702"
                  className="w-full bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Call: +92 335 9939 702</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DESCRIPTION & FEATURES & VISIT BOOKING FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Description (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs">
              <h2 className="font-serif font-bold text-base sm:text-lg text-karobaari-darkGray mb-2 pb-1.5 border-b border-gray-100">
                Detailed Property Description
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">
                {property.description}
              </p>

              <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray mb-2.5">
                Key Features &amp; Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                {property.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Lead Capture Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs sticky top-24">
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 mb-3">
                <Calendar className="w-4 h-4 text-karobaari-maroon" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray">
                  Book an On-Site Visit
                </h3>
              </div>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center text-green-800">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-1.5" />
                  <h4 className="font-bold text-xs sm:text-sm">Visit Request Received!</h4>
                  <p className="text-[11px] mt-1 text-green-700">
                    Our property advisor will call you shortly on WhatsApp.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-2.5 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Ali"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">WhatsApp Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0333 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Message / Inquiries</label>
                    <textarea
                      rows={2}
                      placeholder="Questions regarding registry, NOC or negotiation..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs py-2.5 rounded-xl shadow flex items-center justify-center gap-1 disabled:opacity-50 mt-2"
                  >
                    <Send className="w-3 h-3" />
                    <span>{loading ? "Submitting..." : "Schedule Free Visit"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}