"use client";

import Link from "next/link";
import Image from "next/image";
import { FileText, ArrowRight, Clock, Layers } from "lucide-react";
import { DigitalBook, Course } from "@/lib/types";

export function BookCard({ book }: { book: DigitalBook }) {
  const currentPrice = book.sale_price ?? book.price;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-karobaari-gold transition-all flex flex-col justify-between group w-full min-w-0 h-full">
      <div>
        <div className="relative aspect-[3/4] bg-karobaari-darkGray overflow-hidden w-full">
          <Image
            src={book.cover_url || "/assets/ebook-cover.jpeg"}
            alt={book.title || "Book"}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-1.5 left-1.5 bg-karobaari-maroon text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
            {book.category}
          </div>
          <div className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded flex items-center gap-0.5">
            <FileText className="w-2.5 h-2.5 text-karobaari-gold" />
            <span>{book.file_format}</span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3.5">
          <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium block truncate">{book.author}</span>
          <Link href={`/digital-books/?slug=${book.slug}`}>
            <h3 className="text-[11px] sm:text-xs font-semibold text-karobaari-darkGray group-hover:text-karobaari-maroon line-clamp-2 h-7 sm:h-8 leading-tight my-1">
              {book.title}
            </h3>
          </Link>
        </div>
      </div>

      <div className="p-2.5 sm:p-3.5 pt-0">
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xs sm:text-sm font-extrabold text-karobaari-maroon">
              {currentPrice === 0 ? "FREE" : `Rs. ${(currentPrice || 0).toLocaleString()}`}
            </span>
            {book.sale_price && (
              <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                Rs. {(book.price || 0).toLocaleString()}
              </span>
            )}
          </div>
          <Link
            href={`/digital-books/?slug=${book.slug}`}
            className="text-[10px] sm:text-xs font-bold text-karobaari-maroon hover:text-karobaari-darkMaroon flex items-center gap-0.5"
          >
            <span>Read</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CourseCard({ course }: { course: Course }) {
  const currentPrice = course.sale_price ?? course.price;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-karobaari-gold transition-all flex flex-col justify-between group w-full min-w-0 h-full">
      <div>
        <div className="relative aspect-video bg-karobaari-darkGray overflow-hidden w-full">
          <Image
            src={course.thumbnail_url || "/assets/course-thumb.jpeg"}
            alt={course.title || "Course"}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-1.5 left-1.5 bg-karobaari-maroon text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
            {course.level}
          </div>
        </div>

        <div className="p-2.5 sm:p-3.5">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-500 mb-1">
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 text-karobaari-gold" /> {course.duration}
            </span>
            <span className="flex items-center gap-0.5">
              <Layers className="w-2.5 h-2.5 text-karobaari-gold" /> {course.modules_count} Mods
            </span>
          </div>

          <Link href={`/courses/?slug=${course.slug}`}>
            <h3 className="text-[11px] sm:text-xs font-semibold text-karobaari-darkGray group-hover:text-karobaari-maroon line-clamp-2 h-7 sm:h-8 leading-tight mb-1">
              {course.title}
            </h3>
          </Link>
          <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{course.short_description}</p>
        </div>
      </div>

      <div className="p-2.5 sm:p-3.5 pt-0">
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xs sm:text-sm font-extrabold text-karobaari-maroon">
              {currentPrice === 0 ? "FREE" : `Rs. ${currentPrice.toLocaleString()}`}
            </span>
            {course.sale_price && (
              <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                Rs. {course.price.toLocaleString()}
              </span>
            )}
          </div>
          <Link
            href={`/courses/?slug=${course.slug}`}
            className="text-[10px] sm:text-xs font-bold text-karobaari-maroon hover:text-karobaari-darkMaroon flex items-center gap-0.5"
          >
            <span>Enroll</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}