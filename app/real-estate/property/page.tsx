import { Suspense } from "react";
import PropertyDetailClient from "./[slug]/PropertyDetailClient";

export default function PropertyRootPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-6 text-xs text-gray-500 font-medium">Loading property...</div>}>
      <PropertyDetailClient />
    </Suspense>
  );
}
