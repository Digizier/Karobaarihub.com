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
  return <BookDetailClient book={book} slug={params.slug} />;
}