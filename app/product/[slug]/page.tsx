import { Suspense } from "react";
import { notFound } from "next/navigation";
import { initialProducts } from "@/lib/mockData";
import { getProductBySlug } from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return initialProducts.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-6 text-xs text-gray-500 font-medium">Loading product...</div>}>
      <ProductDetailClient product={product} slug={params.slug} />
    </Suspense>
  );
}