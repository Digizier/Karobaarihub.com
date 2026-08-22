import { Suspense } from "react";
import { initialCourses } from "@/lib/mockData";
import { getCourseBySlug } from "@/lib/db";
import CourseDetailClient from "./CourseDetailClient";

export function generateStaticParams() {
  return initialCourses.map((c) => ({
    slug: c.slug,
  }));
}

export default async function SingleCoursePage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-6 text-xs text-gray-500 font-medium">Loading course...</div>}>
      <CourseDetailClient course={course} slug={params.slug} />
    </Suspense>
  );
}