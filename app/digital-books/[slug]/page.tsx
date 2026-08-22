import { Suspense } from "react";
import { initialDigitalBooks } from "@/lib/mockData";
import { getDigitalBookBySlug } from "@/lib/db";
import BookDetailClient from "./BookDetailClient";

export function generateStaticParams() {
  return initialDigitalBooks.map((b) => ({
    slug: b.slug,
  }));
}

export default async function SingleBookPage({ params }: { params: { slug: string } }) {
  const book = await getDigitalBookBySlug(params.slug);
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-6 text-xs text-gray-500 font-medium">Loading e-book...</div>}>
      <BookDetailClient book={book} slug={params.slug} />
    </Suspense>
  );
}