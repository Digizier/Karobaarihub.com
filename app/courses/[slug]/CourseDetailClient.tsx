"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { Clock, Layers, GraduationCap, CheckCircle2, ArrowLeft, PhoneCall, PlayCircle, BookOpen } from "lucide-react";
import { Course } from "@/lib/types";
import { getCourseBySlug } from "@/lib/db";

interface CourseDetailClientProps {
  course?: Course | null;
  slug?: string;
}

export default function CourseDetailClient({ course: initialCourse, slug: propSlug }: CourseDetailClientProps) {
  const searchParams = useSearchParams();
  const params = useParams();
  const activeSlug = propSlug || (params?.slug as string) || searchParams?.get("slug") || "";

  const [course, setCourse] = useState<Course | null>(initialCourse || null);
  const [loading, setLoading] = useState(!initialCourse);

  useEffect(() => {
    if (initialCourse && (!activeSlug || initialCourse.slug === activeSlug)) {
      setCourse(initialCourse);
      setLoading(false);
      return;
    }
    if (activeSlug) {
      setLoading(true);
      getCourseBySlug(activeSlug).then((res) => {
        setCourse(res);
        setLoading(false);
      });
    }
  }, [activeSlug, initialCourse]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-karobaari-maroon border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="font-serif font-bold text-lg text-gray-900 mb-2">Course Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-4">
          The requested academy course could not be located or has been updated.
        </p>
        <Link
          href="/courses"
          className="bg-karobaari-maroon text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-karobaari-darkMaroon transition-colors"
        >
          Browse All Courses
        </Link>
      </div>
    );
  }

  const currentPrice = course.sale_price ?? course.price;
  const whatsappMsg = encodeURIComponent(
    `Hello Karobaari Hub Academy, I want to enroll in the course: "${course.title}" (Rs. ${currentPrice}).`
  );

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-10 w-full overflow-hidden">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <Link href="/courses" className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 hover:text-karobaari-maroon mb-4 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Courses
        </Link>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-200 w-full">
            <Image src={course.thumbnail_url} alt={course.title} fill unoptimized className="object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 text-karobaari-maroon flex items-center justify-center shadow-xl">
                <PlayCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          <div className="text-xs">
            <span className="bg-karobaari-maroon text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded">
              {course.level}
            </span>
            <h1 className="font-serif font-bold text-xl sm:text-3xl text-karobaari-darkGray mt-2 leading-snug">
              {course.title}
            </h1>
            <p className="text-gray-500 text-xs mt-1">Instructor: <strong className="text-gray-700">{course.instructor}</strong></p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 my-3 py-2.5 border-y border-gray-100 text-gray-600 text-[11px] sm:text-xs">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-karobaari-maroon" /> Duration: <strong>{course.duration}</strong></span>
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-karobaari-maroon" /> Modules: <strong>{course.modules_count}</strong></span>
              <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-purple-700" /> Lessons: <strong>{course.lessons_count}</strong></span>
            </div>

            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4">{course.description}</p>

            {course.curriculum && course.curriculum.length > 0 && (
              <div className="my-4 space-y-2.5">
                <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray">Course Curriculum:</h3>
                {course.curriculum.map((mod, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                    <h4 className="font-bold text-xs text-karobaari-darkGray mb-1.5">{mod.module_title}</h4>
                    <ul className="space-y-1 text-gray-600 pl-1 text-[11px] sm:text-xs">
                      {mod.lessons.map((les, j) => (
                        <li key={j} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-karobaari-maroon flex-shrink-0" />
                          <span>{les}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-2xl sm:text-3xl font-serif font-extrabold text-karobaari-maroon">
                {currentPrice === 0 ? "FREE" : `Rs. ${currentPrice.toLocaleString()}`}
              </div>
              <a
                href={`https://wa.me/923359939702?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Enroll Instantly via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
