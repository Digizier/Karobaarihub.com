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
  return <ProductDetailClient product={product} slug={params.slug} />;
}