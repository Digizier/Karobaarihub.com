import HomePageClient from "./HomePageClient";
import {
  getBanners,
  getVouchers,
  getProducts,
  getProperties,
  getDigitalBooks,
  getCourses,
  getCategories,
  getTestimonials,
} from "@/lib/db";

export default async function HomePage() {
  const [
    banners,
    vouchers,
    categories,
    { products: flashProducts },
    { products: justForYouProducts },
    { properties },
    books,
    courses,
    testimonials,
  ] = await Promise.all([
    getBanners(),
    getVouchers(),
    getCategories(),
    getProducts({ flashSaleOnly: true, limit: 6 }),
    getProducts({ limit: 12 }),
    getProperties({ limit: 6, featuredOnly: false }),
    getDigitalBooks(),
    getCourses(),
    getTestimonials(),
  ]);

  return (
    <HomePageClient
      initialBanners={banners}
      initialVouchers={vouchers}
      initialCategories={categories}
      initialFlashProducts={flashProducts}
      initialJustForYouProducts={justForYouProducts}
      initialProperties={properties}
      initialBooks={books}
      initialCourses={courses}
      initialTestimonials={testimonials}
    />
  );
}