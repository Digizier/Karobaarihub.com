"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CourseCard } from "@/components/BookCard";
import { getCourses } from "@/lib/db";
import { Course } from "@/lib/types";
import { initialCourses } from "@/lib/mockData";
import CourseDetailClient from "./[slug]/CourseDetailClient";

function CoursesContent() {
  const searchParams = useSearchParams();
  const slug = searchParams?.get("slug");

  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses().then((res) => {
      if (res && res.length > 0) {
        setCourses(res);
      }
      setLoading(false);
    });
  }, []);

  if (slug) {
    return <CourseDetailClient slug={slug} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-karobaari-maroon tracking-wider">
            Online Academy
          </span>
          <h1 className="font-serif font-bold text-xl sm:text-3xl text-karobaari-darkGray mt-1">
            Skill &amp; Business Mastery Courses
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-relaxed">
            Practical video curriculum by seasoned Pakistani entrepreneurs in e-commerce dropshipping, real estate investing, and digital growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-6 text-xs text-gray-500 font-medium">Loading courses...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
