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
  PlayCircle,
  X,
} from "lucide-react";
import { Product, ProductVariant } from "@/lib/types";
import { addToCart } from "@/lib/cart";
import { getProductBySlug, getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

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
  const [selectedSize, setSelectedSize] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductVariant | null>(null);
  const [selectedGeneral, setSelectedGeneral] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (initialProduct && (!activeSlug || initialProduct.slug === activeSlug)) {
      setProduct(initialProduct);
      setSelectedImage(initialProduct.thumbnail_url);
      const vars = initialProduct.variants || [];
      setSelectedSize(vars.find((v) => v.type === "size") || null);
      setSelectedColor(vars.find((v) => v.type === "color") || null);
      setSelectedGeneral(vars.find((v) => !v.type || v.type === "custom") || null);
      setLoading(false);
      return;
    }
    if (activeSlug) {
      setLoading(true);
      getProductBySlug(activeSlug).then((res) => {
        setProduct(res);
        if (res?.thumbnail_url) setSelectedImage(res.thumbnail_url);
        const vars = res?.variants || [];
        setSelectedSize(vars.find((v) => v.type === "size") || null);
        setSelectedColor(vars.find((v) => v.type === "color") || null);
        setSelectedGeneral(vars.find((v) => !v.type || v.type === "custom") || null);
        setLoading(false);
      });
    }
  }, [activeSlug, initialProduct]);

  useEffect(() => {
    getProducts().then((res) => {
      if (res?.products && res.products.length > 0) {
        setRelatedProducts(res.products.filter((p) => p.slug !== activeSlug).slice(0, 4));
      }
    });
  }, [activeSlug]);

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

  const videoId = getYouTubeVideoId(product.video_url);

  // Pricing logic: Regular Price is original/crossed-out, Sale Price is active selling price
  // Pricing is governed by selected size variant or general variant; color variants have no independent prices.
  const activePricingVariant = selectedSize || selectedGeneral;
  const hasProductSale = typeof product.sale_price === "number" && product.sale_price > 0 && product.sale_price < product.price;

  let currentPrice: number;
  let originalPrice: number;

  if (activePricingVariant) {
    const hasVarSale = typeof activePricingVariant.sale_price === "number" && activePricingVariant.sale_price > 0 && activePricingVariant.sale_price < activePricingVariant.price;
    if (hasVarSale) {
      currentPrice = activePricingVariant.sale_price!;
      originalPrice = activePricingVariant.price;
    } else if (hasProductSale && (activePricingVariant.price === product.price || !activePricingVariant.price)) {
      currentPrice = product.sale_price!;
      originalPrice = product.price;
    } else {
      currentPrice = activePricingVariant.price || (hasProductSale ? product.sale_price! : product.price);
      originalPrice = hasProductSale ? product.price : currentPrice;
    }
  } else {
    currentPrice = hasProductSale ? product.sale_price! : product.price;
    originalPrice = product.price;
  }

  const discountPercent = originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  const currentStock = (selectedSize?.stock && selectedSize.stock > 0)
    ? selectedSize.stock
    : (selectedGeneral?.stock ?? product.stock);

  const getCombinedVariantName = (): string | undefined => {
    const parts: string[] = [];
    if (selectedSize) parts.push(`Size: ${selectedSize.name}`);
    if (selectedColor) parts.push(`Color: ${selectedColor.name}`);
    if (selectedGeneral) parts.push(selectedGeneral.name);
    return parts.length > 0 ? parts.join(" | ") : undefined;
  };

  const getActiveVariantId = (): string => {
    return selectedSize?.id || selectedColor?.id || selectedGeneral?.id || product.id;
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: getActiveVariantId(),
        product_id: product.id,
        type: "ecommerce",
        title: product.name,
        slug: product.slug,
        price: currentPrice,
        original_price: originalPrice,
        thumbnail_url: selectedSize?.image_url || selectedColor?.image_url || product.thumbnail_url,
        variant_name: getCombinedVariantName(),
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
        id: getActiveVariantId(),
        product_id: product.id,
        type: "ecommerce",
        title: product.name,
        slug: product.slug,
        price: currentPrice,
        original_price: originalPrice,
        thumbnail_url: selectedSize?.image_url || selectedColor?.image_url || product.thumbnail_url,
        variant_name: getCombinedVariantName(),
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
            {showVideo && videoId ? (
              <div className="relative aspect-square w-full bg-black rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={product.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  type="button"
                  onClick={() => setShowVideo(false)}
                  className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md z-20 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close Video</span>
                </button>
              </div>
            ) : (
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
            )}

            {/* Multiple Images & Video Thumbnail Strip */}
            {(uniqueGalleryImages.length > 1 || videoId) && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {videoId && (
                  <button
                    type="button"
                    onClick={() => setShowVideo(true)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 flex flex-col items-center justify-center bg-gray-900 text-white transition-all shadow-xs cursor-pointer ${
                      showVideo
                        ? "border-red-600 ring-2 ring-red-600/30"
                        : "border-gray-300 hover:border-red-500 opacity-90 hover:opacity-100"
                    }`}
                    title="Watch Product Video"
                  >
                    <PlayCircle className="w-6 h-6 text-red-500" />
                    <span className="text-[9px] font-bold mt-0.5">Video</span>
                  </button>
                )}

                {uniqueGalleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(imgUrl);
                      setShowVideo(false);
                    }}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all shadow-xs cursor-pointer ${
                      !showVideo && selectedImage === imgUrl
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

              {/* Multi-Variant Selector (Color & Size) */}
              {product.variants && product.variants.length > 0 && (() => {
                const colorVariants = product.variants.filter((v) => v.type === "color");
                const sizeVariants = product.variants.filter((v) => v.type === "size");
                const generalVariants = product.variants.filter((v) => !v.type || v.type === "custom");

                return (
                  <div className="my-3 space-y-3">
                    {/* 1. Size Variants (Above) */}
                    {sizeVariants.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-gray-700 block mb-1.5">
                          Select Size: {selectedSize && <span className="text-karobaari-maroon font-extrabold ml-1">{selectedSize.name}</span>}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sizeVariants.map((v) => {
                            const isSelected = selectedSize?.id === v.id;
                            const vSale = v.sale_price && v.sale_price > 0 && v.sale_price < v.price ? v.sale_price : undefined;
                            const vPrice = vSale || v.price;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setSelectedSize(v)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-karobaari-maroon text-white border-karobaari-maroon shadow-xs ring-2 ring-karobaari-maroon/20"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                }`}
                              >
                                <span>{v.name}</span>
                                {vPrice && vPrice !== product.price ? (
                                  <span className="ml-1 text-[10px] opacity-85 font-normal">
                                    (Rs. {vPrice.toLocaleString()})
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. Color Variants (Below, clean, NO prices!) */}
                    {colorVariants.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-gray-700 block mb-1.5">
                          Select Color: {selectedColor && <span className="text-karobaari-maroon font-extrabold ml-1">{selectedColor.name}</span>}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {colorVariants.map((v) => {
                            const isSelected = selectedColor?.id === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setSelectedColor(v)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-karobaari-maroon text-white border-karobaari-maroon shadow-xs ring-2 ring-karobaari-maroon/20"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-karobaari-maroon"}`} />
                                <span>{v.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* General / Legacy Options */}
                    {generalVariants.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-gray-700 block mb-1.5">
                          Select Option: {selectedGeneral && <span className="text-karobaari-maroon font-extrabold ml-1">{selectedGeneral.name}</span>}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {generalVariants.map((v) => {
                            const isSelected = selectedGeneral?.id === v.id;
                            const vSale = v.sale_price && v.sale_price > 0 && v.sale_price < v.price ? v.sale_price : undefined;
                            const vPrice = vSale || v.price;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setSelectedGeneral(v)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-karobaari-maroon text-white border-karobaari-maroon shadow-xs ring-2 ring-karobaari-maroon/20"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                }`}
                              >
                                <span>{v.name}</span>
                                {vPrice ? (
                                  <span className="ml-1 text-[10px] opacity-85 font-normal">
                                    (Rs. {vPrice.toLocaleString()})
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

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

          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4">
            {product.short_description && (
              <p className="font-semibold text-gray-800 bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 leading-relaxed">
                {product.short_description}
              </p>
            )}
            <div className="whitespace-pre-line text-gray-700 leading-relaxed text-xs sm:text-sm">
              {product.description ||
                product.short_description ||
                "High quality authentic product from Karobaari Hub with 100% satisfaction guarantee and fast Cash on Delivery across Pakistan."}
            </div>

            {/* Product Specifications & Information */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-200">
                <h4 className="font-serif font-bold text-xs sm:text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-karobaari-gold" />
                  <span>Product Specifications &amp; Key Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <span className="font-semibold text-gray-500">{key}</span>
                      <span className="font-bold text-gray-900 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
