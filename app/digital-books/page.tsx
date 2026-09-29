"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BookCard } from "@/components/BookCard";
import { getDigitalBooks } from "@/lib/db";
import { DigitalBook } from "@/lib/types";
import BookDetailClient from "./[slug]/BookDetailClient";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

const ITEMS_PER_PAGE = 8;

function DigitalBooksContent() {
  const searchParams = useSearchParams();
  const slug = searchParams?.get("slug");

  const [books, setBooks] = useState<DigitalBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const visibleBooks = books.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-6">
              {visibleBooks.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="mt-8 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-gray-500 text-[11px] sm:text-xs">
                  Showing <span className="font-bold text-karobaari-maroon">{startIndex + 1}</span> to{" "}
                  <span className="font-bold text-karobaari-maroon">
                    {Math.min(startIndex + ITEMS_PER_PAGE, books.length)}
                  </span>{" "}
                  of <span className="font-bold text-karobaari-darkGray">{books.length}</span> Digital Books
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                      page === 1
                        ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer bg-white"
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          page === pageNum
                            ? "bg-karobaari-maroon text-white shadow-xs"
                            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                      page === totalPages
                        ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer bg-white"
                    }`}
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
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
