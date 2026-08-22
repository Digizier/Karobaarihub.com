"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { ArrowLeft, PhoneCall, BookOpen } from "lucide-react";
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

  const currentPrice = book.sale_price ?? book.price;
  const whatsappMsg = encodeURIComponent(
    `Hello Karobaari Hub, I would like to purchase the e-book: "${book.title}" (Rs. ${currentPrice}).`
  );

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-10 w-full overflow-hidden">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <Link href="/digital-books" className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 hover:text-karobaari-maroon mb-4 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Books
        </Link>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8">
          <div className="md:col-span-4 flex justify-center">
            <div className="relative aspect-[3/4] w-48 sm:w-full rounded-xl overflow-hidden shadow border border-gray-200">
              <Image src={book.cover_url} alt={book.title} fill unoptimized className="object-cover" />
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col justify-between text-xs">
            <div>
              <span className="bg-karobaari-maroon text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded">
                {book.category}
              </span>
              <h1 className="font-serif font-bold text-lg sm:text-2xl text-karobaari-darkGray mt-2 leading-snug">
                {book.title}
              </h1>
              <p className="text-gray-500 text-xs mt-1">Author: <strong className="text-gray-700">{book.author}</strong></p>

              <div className="flex items-center gap-3 sm:gap-4 my-3 py-2 border-y border-gray-100 text-gray-600 text-[11px] sm:text-xs">
                <span>Format: <strong>{book.file_format}</strong></span>
                <span>Pages: <strong>{book.pages_count}</strong></span>
                <span>Size: <strong>{book.file_size_mb} MB</strong></span>
              </div>

              <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">{book.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xl sm:text-2xl font-serif font-extrabold text-karobaari-maroon">
                {currentPrice === 0 ? "FREE" : `Rs. ${currentPrice.toLocaleString()}`}
              </div>
              <a
                href={`https://wa.me/923359939702?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-xl shadow flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Get Instant Access on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
