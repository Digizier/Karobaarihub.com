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
  return <PropertyDetailClient property={property} slug={params.slug} />;
}