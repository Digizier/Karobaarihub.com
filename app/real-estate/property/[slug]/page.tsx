import { Suspense } from "react";
import { notFound } from "next/navigation";
import { initialProperties } from "@/lib/mockData";
import { getPropertyBySlug } from "@/lib/db";
import PropertyDetailClient from "./PropertyDetailClient";

export function generateStaticParams() {
  return initialProperties.map((p) => ({
    slug: p.slug,
  }));
}

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = await getPropertyBySlug(params.slug);
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-6 text-xs text-gray-500 font-medium">Loading property...</div>}>
      <PropertyDetailClient property={property} slug={params.slug} />
    </Suspense>
  );
}