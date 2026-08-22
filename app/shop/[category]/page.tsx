import { initialCategories } from "@/lib/mockData";
import ShopPage from "../page";

export function generateStaticParams() {
  return initialCategories.map((c) => ({
    category: c.slug,
  }));
}

export default function CategoryShopPage() {
  return <ShopPage />;
}