import { Suspense } from "react";
import ProductDetailClient from "./[slug]/ProductDetailClient";

export default function ProductRootPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-6 text-xs text-gray-500 font-medium">Loading product...</div>}>
      <ProductDetailClient />
    </Suspense>
  );
}
