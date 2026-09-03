"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { ArrowLeft, PhoneCall, BookOpen, CheckCircle2, ShieldCheck, Download, FileText } from "lucide-react";
import { DigitalBook } from "@/lib/types";
import { getDigitalBookBySlug } from "@/lib/db";

interface BookDetailClientProps {
  book?: DigitalBook | null;
  slug?: string;
}

export default function BookDetailClient({ book: initialBook, slug: propSlug }: BookDetailClientProps) {
  const searchParams = useSearchParams();
  const params = useParams();
  const activeSlug = propSlug || (params?.slug as string) || searchParams?.get("slug") || "";

  const [book, setBook] = useState<DigitalBook | null>(initialBook || null);
  const [loading, setLoading] = useState(!initialBook);

  useEffect(() => {
    if (initialBook && (!activeSlug || initialBook.slug === activeSlug)) {
      setBook(initialBook);
      setLoading(false);
      return;
    }
    if (activeSlug) {
      setLoading(true);
      getDigitalBookBySlug(activeSlug).then((res) => {
        setBook(res);
        setLoading(false);
      });
    }
  }, [activeSlug, initialBook]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-karobaari-maroon border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Loading e-book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-7 h-7" />
        </div>
        <h2 className="font-serif font-bold text-lg text-gray-900 mb-2">E-Book Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-4">
          The requested digital publication could not be located or has been updated.
        </p>
        <Link
          href="/digital-books"
          className="bg-karobaari-maroon text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-karobaari-darkMaroon transition-colors"
        >
          Browse All E-Books
        </Link>
      </div>
    );
  }

  // Pricing logic: Regular Price is original/crossed-out, Sale Price is active selling price
  const hasSale = typeof book.sale_price === "number" && book.sale_price > 0 && book.sale_price < book.price;
  const currentPrice = hasSale ? book.sale_price! : book.price;
  const regularPrice = book.price;
  const discountPct = hasSale ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;

  const whatsappMsg = encodeURIComponent(
    `Hello Karobaari Hub, I would like to purchase the e-book: "${book.title}" (Rs. ${currentPrice.toLocaleString()}).`
  );

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-8 w-full overflow-hidden">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/digital-books"
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 hover:text-karobaari-maroon font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Digital Library</span>
          </Link>
        </div>

        {/* TOP HERO SECTION: Cover, Key Specs, Pricing & WhatsApp CTA */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-7 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Book Cover Image */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative aspect-[3/4] w-52 sm:w-full max-w-xs rounded-2xl overflow-hidden shadow-lg border border-gray-200 group">
                <Image
                  src={book.cover_url || "/assets/ebook-cover.jpeg"}
                  alt={book.title || "Book"}
                  fill
                  unoptimized
                  className="object-cover"
                />
                {/* Sale Discount Badge */}
                {hasSale && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md tracking-wide">
                    -{discountPct}% OFF
                  </div>
                )}
                {/* Format badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                  <FileText className="w-3 h-3 text-karobaari-gold" />
                  <span>{book.file_format || "PDF"}</span>
                </div>
              </div>
            </div>

            {/* Book Meta, Pricing & Instant Action */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <span className="bg-karobaari-maroon text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                  {book.category}
                </span>

                <h1 className="font-serif font-bold text-xl sm:text-2xl text-karobaari-darkGray mt-2 leading-snug">
                  {book.title}
                </h1>

                <p className="text-gray-500 text-xs mt-1">
                  Author &amp; Publisher: <strong className="text-gray-800 font-semibold">{book.author}</strong>
                </p>

                {/* PRICING BLOCK (Sale + Regular + Discount) */}
                <div className="mt-3.5 p-3.5 bg-red-50/50 rounded-xl border border-red-100 flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-serif font-extrabold text-karobaari-maroon">
                    {currentPrice === 0 ? "FREE" : `Rs. ${currentPrice.toLocaleString()}`}
                  </span>
                  {hasSale && (
                    <>
                      <span className="text-sm sm:text-base text-gray-400 line-through font-medium">
                        Rs. {regularPrice.toLocaleString()}
                      </span>
                      <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Save {discountPct}% (Rs. {(regularPrice - currentPrice).toLocaleString()} Off)
                      </span>
                    </>
                  )}
                </div>

                {/* Key Specifications Grid */}
                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Format</span>
                    <span className="text-xs font-bold text-gray-800">{book.file_format || "PDF"}</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Length</span>
                    <span className="text-xs font-bold text-gray-800">{book.pages_count || 85} Pages</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">File Size</span>
                    <span className="text-xs font-bold text-gray-800">{book.file_size_mb || 12} MB</span>
                  </div>
                </div>

                {/* WhatsApp Instant CTA Button */}
                <div className="space-y-2 pt-1">
                  <a
                    href={`https://wa.me/923359939702?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Get Instant Access on WhatsApp</span>
                  </a>
                  <p className="text-[10px] sm:text-[11px] text-center text-gray-400 font-medium">
                    Order details &amp; instant direct download link delivered immediately to your WhatsApp.
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 flex-wrap gap-2">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Digital Access</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-karobaari-maroon" />
                    <span>Verified Knowledge Publication</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lifetime PDF Access</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DEDICATED DESCRIPTION & KEY CHAPTERS SECTION (Below Hero) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 shadow-xs mt-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-karobaari-maroon flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-gray-900">
                About this E-Book &amp; Key Chapters
              </h2>
              <p className="text-[11px] text-gray-400">Complete summary and contents overview</p>
            </div>
          </div>

          <div className="text-gray-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line space-y-3 font-normal">
            {book.description || "Detailed overview and chapter breakdown will be updated soon."}
          </div>

          {/* Secondary Bottom Order Strip */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
            <div>
              <span className="text-xs font-bold text-gray-800 block">Ready to start reading?</span>
              <span className="text-[11px] text-gray-500">
                Get full access for only <strong className="text-karobaari-maroon font-bold">Rs. {currentPrice.toLocaleString()}</strong>
              </span>
            </div>
            <a
              href={`https://wa.me/923359939702?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-colors shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Get on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
