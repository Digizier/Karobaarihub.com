"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  MapPin,
  ShoppingCart,
  Zap,
  Check,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { Product, ProductVariant } from "@/lib/types";
import { addToCart } from "@/lib/cart";
import { getProductBySlug, getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

interface ProductDetailClientProps {
  product?: Product | null;
  slug?: string;
}

export default function ProductDetailClient({ product: initialProduct, slug: propSlug }: ProductDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const activeSlug = propSlug || (params?.slug as string) || searchParams?.get("slug") || "";

  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImage, setSelectedImage] = useState(initialProduct?.thumbnail_url || "/assets/cloth-stand-1.jpeg");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    initialProduct?.variants && initialProduct.variants.length > 0 ? initialProduct.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (initialProduct && (!activeSlug || initialProduct.slug === activeSlug)) {
      setProduct(initialProduct);
      setSelectedImage(initialProduct.thumbnail_url);
      setSelectedVariant(initialProduct.variants && initialProduct.variants.length > 0 ? initialProduct.variants[0] : null);
      setLoading(false);
      return;
    }
    if (activeSlug) {
      setLoading(true);
      getProductBySlug(activeSlug).then((res) => {
        setProduct(res);
        if (res) {
          setSelectedImage(res.thumbnail_url);
          setSelectedVariant(res.variants && res.variants.length > 0 ? res.variants[0] : null);
        }
        setLoading(false);
      });
    }
  }, [activeSlug, initialProduct]);

  useEffect(() => {
    if (product) {
      getProducts({
        categorySlug: product.category_slug || undefined,
        limit: 8,
      }).then((res) => {
        const filtered = res.products
          .filter((p) => p.id !== product.id && p.slug !== product.slug)
          .slice(0, 4);
        setRelatedProducts(filtered);
      });
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-karobaari-maroon border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h2 className="font-serif font-bold text-lg text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-4">
          The requested product could not be located in our catalog or has been updated.
        </p>
        <Link
          href="/shop"
          className="bg-karobaari-maroon text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-karobaari-darkMaroon transition-colors"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.sale_price ?? selectedVariant?.price ?? product.sale_price ?? product.price;
  const originalPrice = selectedVariant?.price ?? product.price;
  const discountPercent = product.sale_price || (selectedVariant && selectedVariant.sale_price)
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  const currentStock = selectedVariant?.stock ?? product.stock;

  const handleAddToCart = () => {
    addToCart(
      {
        id: selectedVariant ? selectedVariant.id : product.id,
        product_id: product.id,
        type: "ecommerce",
        title: product.name,
        slug: product.slug,
        price: currentPrice,
        original_price: originalPrice,
        thumbnail_url: selectedVariant?.image_url || product.thumbnail_url,
        variant_name: selectedVariant?.name,
        stock_available: currentStock,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(
      {
        id: selectedVariant ? selectedVariant.id : product.id,
        product_id: product.id,
        type: "ecommerce",
        title: product.name,
        slug: product.slug,
        price: currentPrice,
        original_price: originalPrice,
        thumbnail_url: selectedVariant?.image_url || product.thumbnail_url,
        variant_name: selectedVariant?.name,
        stock_available: currentStock,
      },
      quantity,
      false
    );
    router.push("/checkout");
  };

  // Collect all gallery images cleanly
  const allGalleryImages = [
    product.thumbnail_url,
    ...(product.images?.map((i: any) => (typeof i === "string" ? i : i?.public_url || i?.url || i?.image_url)) || []),
  ].filter(Boolean) as string[];
  const uniqueGalleryImages = Array.from(new Set(allGalleryImages));

  return (
    <div className="bg-gray-50 min-h-screen py-3 sm:py-6 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mb-3 truncate">
          <Link href="/" className="hover:text-karobaari-maroon flex-shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <Link href="/shop" className="hover:text-karobaari-maroon flex-shrink-0">Marketplace</Link>
          {product.category_name && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <Link href={`/shop/${product.category_slug || ""}`} className="hover:text-karobaari-maroon flex-shrink-0 truncate">
                {product.category_name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-karobaari-darkGray font-medium truncate">{product.name}</span>
        </div>

        {/* 1. PRODUCT HERO */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs p-3.5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
          {/* Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative aspect-square w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <Image
                src={selectedImage || product.thumbnail_url || "/assets/cloth-stand-1.jpeg"}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
              {discountPercent && (
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white font-extrabold text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded shadow">
                  -{discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Multiple Images Thumbnail Strip */}
            {uniqueGalleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {uniqueGalleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all shadow-xs ${
                      selectedImage === imgUrl
                        ? "border-karobaari-maroon ring-2 ring-karobaari-maroon/20"
                        : "border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image src={imgUrl} alt={`Thumbnail ${idx + 1}`} fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Variants (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-karobaari-maroon tracking-wider uppercase">
                {product.brand_name || "Karobaari Hub Authentic"}
              </span>
              <h1 className="font-serif font-bold text-base sm:text-2xl text-karobaari-darkGray mt-1 leading-snug">
                {product.name}
              </h1>

              {/* Ratings and Sales */}
              <div className="flex items-center gap-2 sm:gap-3 my-2 text-xs text-gray-500">
                <div className="flex items-center text-amber-500 font-bold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                        i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-karobaari-darkGray">{product.rating.toFixed(1)}</span>
                </div>
                <span>|</span>
                <span>{product.review_count} Ratings</span>
                <span>|</span>
                <span>{product.sales_count} Sold</span>
              </div>

              {/* Pricing Display */}
              <div className="bg-red-50/70 border border-red-200 rounded-xl p-2.5 sm:p-3 my-2.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl sm:text-3xl font-extrabold text-karobaari-maroon font-sans">
                    Rs. {currentPrice.toLocaleString()}
                  </span>
                  {originalPrice > currentPrice && (
                    <span className="text-xs sm:text-sm text-gray-400 line-through">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-white px-1.5 py-0.5 rounded border border-red-300">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="my-3">
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">
                    Select Option:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          selectedVariant?.id === v.id
                            ? "bg-karobaari-maroon text-white border-karobaari-maroon shadow-xs"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {v.name}
                        {v.sale_price && (
                          <span className="ml-1 text-[10px] opacity-80">
                            (Rs. {v.sale_price.toLocaleString()})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Picker */}
              <div className="my-3">
                <span className="text-xs font-bold text-gray-700 block mb-1.5">Quantity:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                      disabled={quantity >= currentStock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {currentStock > 0 ? (
                      <span>{currentStock} units available</span>
                    ) : (
                      <span className="text-red-600 font-bold">Out of Stock</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                  added
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-karobaari-maroon border-karobaari-maroon hover:bg-red-50 shadow-xs"
                }`}
              >
                {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                <span>{added ? "Added" : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="py-2.5 sm:py-3 rounded-xl bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs sm:text-sm shadow flex items-center justify-center gap-1.5 border border-karobaari-gold/40 transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-karobaari-gold fill-karobaari-gold" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Delivery Options (3 cols) */}
          <div className="lg:col-span-3 bg-gray-50 rounded-xl p-3.5 sm:p-4 border border-gray-200 text-xs space-y-3.5">
            <div>
              <span className="text-[9px] font-bold uppercase text-gray-400 block mb-1">Delivery Options</span>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-karobaari-darkGray block text-xs">All Pakistan Delivery</span>
                  <span className="text-gray-500 text-[10px]">Punjab, Sindh, KPK, Islamabad, Balochistan</span>
                </div>
              </div>

              <div className="mt-2.5 flex items-start gap-2 pt-2.5 border-t border-gray-200">
                <Truck className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-karobaari-darkGray text-xs">Standard Delivery</span>
                    <span className="font-bold text-karobaari-maroon text-xs">Rs. 199</span>
                  </div>
                  <span className="text-gray-500 text-[10px]">Delivered in 2-4 business days</span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-gray-200">
              <span className="text-[9px] font-bold uppercase text-gray-400 block mb-1">Return &amp; Warranty</span>
              <div className="flex items-start gap-2 mb-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-karobaari-darkGray text-xs">7 Days Easy Return</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-karobaari-darkGray text-xs">100% Authentic Product</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DEDICATED PRODUCT DESCRIPTION CARD */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs mt-4 sm:mt-6 p-4 sm:p-7">
          <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-karobaari-maroon"></span>
              Product Description &amp; Specifications
            </h3>
            {product.brand_name && (
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                Brand: {product.brand_name}
              </span>
            )}
          </div>

          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
            {product.short_description && (
              <p className="font-semibold text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                {product.short_description}
              </p>
            )}
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {product.description ||
                product.short_description ||
                "High quality authentic product from Karobaari Hub with 100% satisfaction guarantee and fast Cash on Delivery across Pakistan."}
            </div>
          </div>
        </div>

        {/* 3. RELATED 4 PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-karobaari-darkGray">
                  Related &amp; Recommended Products
                </h3>
                <p className="text-[11px] text-gray-500">
                  More popular items from {product.category_name || "our catalog"}
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-karobaari-maroon hover:underline flex items-center gap-1"
              >
                View All Marketplace <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
