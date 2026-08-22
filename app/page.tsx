import HomePageClient from "./HomePageClient";
import {
  initialBanners,
  initialVouchers,
  initialCategories,
  initialProducts,
  initialProperties,
  initialDigitalBooks,
  initialCourses,
  initialTestimonials,
} from "@/lib/mockData";

export default function HomePage() {
  return (
    <HomePageClient
      initialBanners={initialBanners}
      initialVouchers={initialVouchers}
      initialCategories={initialCategories}
      initialFlashProducts={initialProducts.filter((p) => p.is_flash_sale)}
      initialJustForYouProducts={initialProducts}
      initialProperties={initialProperties}
      initialBooks={initialDigitalBooks}
      initialCourses={initialCourses}
      initialTestimonials={initialTestimonials}
    />
  );
}