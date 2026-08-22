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
  return <CourseDetailClient course={course} slug={params.slug} />;
}