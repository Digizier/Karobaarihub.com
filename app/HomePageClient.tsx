"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import Hero from "@/components/Hero";
import FlashSale from "@/components/FlashSale";
import ProductGrid from "@/components/ProductGrid";
import PropertyCard from "@/components/PropertyCard";
import { BookCard, CourseCard } from "@/components/BookCard";
import {
  getBanners,
  getVouchers,
  getProducts,
  getProperties,
  getDigitalBooks,
  getCourses,
  getCategories,
  getTestimonials,
} from "@/lib/db";
import {
  Banner,
  Voucher,
  Category,
  Product,
  Property,
  DigitalBook,
  Course,
  Testimonial,
} from "@/lib/types";

interface HomePageClientProps {
  initialBanners: Banner[];
  initialVouchers: Voucher[];
  initialCategories: Category[];
  initialFlashProducts: Product[];
  initialJustForYouProducts: Product[];
  initialProperties: Property[];
  initialBooks: DigitalBook[];
  initialCourses: Course[];
  initialTestimonials: Testimonial[];
}

export default function HomePageClient(props: HomePageClientProps) {
  const [banners, setBanners] = useState(props.initialBanners);
  const [vouchers, setVouchers] = useState(props.initialVouchers);
  const [categories, setCategories] = useState(props.initialCategories);
  const [flashProducts, setFlashProducts] = useState(props.initialFlashProducts);
  const [justForYouProducts, setJustForYouProducts] = useState(props.initialJustForYouProducts);
  const [properties, setProperties] = useState(props.initialProperties);
  const [books, setBooks] = useState(props.initialBooks);
  const [courses, setCourses] = useState(props.initialCourses);
  const [testimonials, setTestimonials] = useState(props.initialTestimonials);

  useEffect(() => {
    const refreshData = () => {
      getBanners().then((b) => b && b.length > 0 && setBanners(b));
      getVouchers().then((v) => v && v.length > 0 && setVouchers(v));
      getCategories().then((c) => c && c.length > 0 && setCategories(c));
      getProducts({ flashSaleOnly: true, limit: 6 }).then((res) => res && res.products.length > 0 && setFlashProducts(res.products));
      getProducts({ limit: 12 }).then((res) => res && res.products.length > 0 && setJustForYouProducts(res.products));
      getProperties({ limit: 6, featuredOnly: false }).then((res) => res && res.properties.length > 0 && setProperties(res.properties));
      getDigitalBooks().then((b) => b && b.length > 0 && setBooks(b));
      getCourses().then((c) => c && c.length > 0 && setCourses(c));
      getTestimonials().then((t) => t && t.length > 0 && setTestimonials(t));
    };

    refreshData();
    window.addEventListener("kb_categories_updated", refreshData);
    window.addEventListener("storage", refreshData);
    return () => {
      window.removeEventListener("kb_categories_updated", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
      {/* 1. HERO SECTION */}
      <Hero banners={banners} vouchers={vouchers} />

      {/* 2. FLASH SALE SECTION */}
      <FlashSale products={flashProducts} />

      {/* 3. CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 w-full">
        <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-gray-200">
          <div>
            <h2 className="font-serif font-bold text-base sm:text-2xl text-karobaari-darkGray">
              Shop Categories
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500">Explore authentic items across marketplace departments</p>
          </div>
          <Link href="/shop" className="text-[11px] sm:text-xs font-semibold text-karobaari-maroon hover:text-karobaari-darkMaroon flex items-center gap-0.5 flex-shrink-0">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="bg-white rounded-xl p-2 sm:p-3 border border-gray-200 shadow-xs hover:shadow-sm hover:border-karobaari-maroon transition-all flex flex-col items-center text-center group min-w-0"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-105 transition-transform flex-shrink-0">
                <Image
                  src={cat.image_url || "/assets/ecommerce-banner-1.jpeg"}
                  alt={cat.name}
                  width={48}
                  height={48}
                  unoptimized
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-karobaari-darkGray group-hover:text-karobaari-maroon line-clamp-1 leading-tight w-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. PRISM REAL ESTATE DIVISION SPOTLIGHT */}
      <section className="bg-gradient-to-b from-gray-900 via-karobaari-darkGray to-black text-white py-6 sm:py-10 my-4 sm:my-8 border-y-2 border-karobaari-gold w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-6 pb-3 border-b border-gray-700">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-karobaari-gold text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Prism Real Estate &amp; Investments</span>
              </div>
              <h2 className="font-serif font-extrabold text-lg sm:text-2xl md:text-3xl text-white">
                Featured Properties &amp; Plots in Rawalpindi / Islamabad
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-300 max-w-2xl mt-1 leading-relaxed">
                Main Stop Shahpur, Adyala Road, DHA, Bahria Town, Askari 14, Lalazar &amp; Gulshanabad with 100% verified registry records.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/real-estate"
                className="bg-karobaari-gold hover:bg-yellow-500 text-karobaari-darkGray text-[11px] sm:text-xs font-bold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-lg shadow transition-transform active:scale-95 flex items-center gap-1 whitespace-nowrap"
              >
                <span>View All Properties</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {properties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Real Estate Trust Box */}
          <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-karobaari-gold flex-shrink-0" />
              <span>Direct Registry &amp; Verified Inteqal / Fard</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-karobaari-gold flex-shrink-0" />
              <span>Sweet Water, Electricity &amp; Paved Streets</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-karobaari-gold flex-shrink-0" />
              <span>On-Site Inspection &amp; Free Valuation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DIGITAL PRODUCTS & ONLINE COURSES HUB */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Digital E-Books */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-gray-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <BookOpen className="w-4 h-4 text-karobaari-maroon flex-shrink-0" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray truncate">
                  Digital E-Books &amp; Blueprints
                </h3>
              </div>
              <Link href="/digital-books" className="text-[11px] sm:text-xs font-semibold text-karobaari-maroon hover:underline flex-shrink-0">
                View All &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {books.slice(0, 2).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>

          {/* Online Courses */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-gray-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <GraduationCap className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray truncate">
                  Video Courses
                </h3>
              </div>
              <Link href="/courses" className="text-[11px] sm:text-xs font-semibold text-purple-700 hover:underline flex-shrink-0">
                View All &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {courses.slice(0, 2).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. JUST FOR YOU — MARKETPLACE */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 w-full">
        <ProductGrid
          title="Just For You"
          subtitle="Top trending items, machinery, clothing, and electronics"
          viewAllHref="/shop"
          products={justForYouProducts}
        />
      </section>

      {/* 7. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 w-full">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-karobaari-maroon tracking-wider">
              Trusted by Pakistani Clients
            </span>
            <h2 className="font-serif font-bold text-lg sm:text-2xl text-karobaari-darkGray mt-0.5">
              Customer &amp; Investor Reviews
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl sm:rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed mb-3">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>
                <div className="pt-2.5 border-t border-gray-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-karobaari-darkMaroon text-white font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-karobaari-darkGray truncate">{t.name}</h4>
                    <span className="text-[10px] text-gray-400 truncate block">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
