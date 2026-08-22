"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BookCard } from "@/components/BookCard";
import { getDigitalBooks } from "@/lib/db";
import { DigitalBook } from "@/lib/types";
import BookDetailClient from "./[slug]/BookDetailClient";

function DigitalBooksContent() {
  const searchParams = useSearchParams();
  const slug = searchParams?.get("slug");

  const [books, setBooks] = useState<DigitalBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDigitalBooks().then((res) => {
      if (res) {
        setBooks(res);
      }
      setLoading(false);
    });
  }, []);

  if (slug) {
    return <BookDetailClient slug={slug} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-karobaari-maroon tracking-wider">
            Digital Knowledge Wing
          </span>
          <h1 className="font-serif font-bold text-xl sm:text-3xl text-karobaari-darkGray mt-1">
            Digital Books &amp; Business Blueprints
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-relaxed">
            Instant PDF &amp; EPUB access to localized Pakistani commerce guides, real estate investment analyses, and skill mastery manuals.
          </p>
        </div>

        {books.length === 0 && loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-6">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DigitalBooksPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-6 text-xs text-gray-500 font-medium">Loading digital books...</div>}>
      <DigitalBooksContent />
    </Suspense>
  );
}
