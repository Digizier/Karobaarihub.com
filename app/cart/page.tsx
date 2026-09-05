"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  X,
  Truck,
} from "lucide-react";
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartSubtotal,
  getAppliedVoucherCode,
  saveAppliedVoucherCode,
} from "@/lib/cart";
import { CartItem, Voucher, SiteSettings } from "@/lib/types";
import { getVouchers, getSiteSettings } from "@/lib/db";
import { initialSiteSettings } from "@/lib/mockData";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);

  const loadCartData = () => {
    setItems(getCartItems());
    getSiteSettings().then((s) => {
      if (s) setSiteSettings(s);
    });
    getVouchers().then((vchs) => {
      setVouchers(vchs);
      const savedCode = getAppliedVoucherCode();
      if (savedCode && vchs.length > 0) {
        const match = vchs.find(
          (v) => v.code.toUpperCase() === savedCode.toUpperCase() && v.is_active
        );
        if (match) {
          setAppliedVoucher(match);
          setVoucherCode(match.code);
        }
      }
    });
  };

  useEffect(() => {
    loadCartData();
    window.addEventListener("kb_settings_updated", loadCartData);
    return () => window.removeEventListener("kb_settings_updated", loadCartData);
  }, []);

  const handleQuantity = (id: string, qty: number) => {
    updateCartQuantity(id, qty);
    setItems(getCartItems());
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setItems(getCartItems());
  };

  const subtotal = getCartSubtotal(items);
  const freeShippingThreshold = siteSettings.free_shipping_threshold || 3000;
  const standardShippingFee = siteSettings.standard_shipping_fee || 199;

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError("");
    const found = vouchers.find(
      (v) => v.code.toUpperCase() === voucherCode.trim().toUpperCase() && v.is_active
    );
    if (!found) {
      setVoucherError("Invalid coupon code.");
      return;
    }
    if (subtotal < found.min_spend) {
      setVoucherError(`Minimum spend of Rs. ${found.min_spend.toLocaleString()} required.`);
      return;
    }
    setAppliedVoucher(found);
    saveAppliedVoucherCode(found.code);
    setVoucherError("");
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
    saveAppliedVoucherCode(null);
  };

  const discountAmount = appliedVoucher
    ? appliedVoucher.discount_type === "percentage"
      ? Math.min(appliedVoucher.max_discount || 999999, (subtotal * appliedVoucher.discount_value) / 100)
      : appliedVoucher.discount_value
    : 0;

  const isOnlyDigital = items.length > 0 && items.every((i) => i.type === "digital_book" || i.type === "course");
  const isFreeShipping =
    isOnlyDigital || appliedVoucher?.is_free_shipping || subtotal >= freeShippingThreshold || items.length === 0;
  const shippingFee = isFreeShipping ? 0 : standardShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const getItemHref = (item: CartItem) => {
    if (item.type === "course") return `/courses/?slug=${item.slug}`;
    if (item.type === "digital_book") return `/digital-books/?slug=${item.slug}`;
    return `/product/?slug=${item.slug}`;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
          <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h2 className="font-serif font-bold text-lg sm:text-xl text-karobaari-darkGray mb-1">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
          Explore our marketplace to discover exclusive products, machinery, courses, and e-books.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 bg-karobaari-maroon text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow hover:bg-karobaari-darkMaroon transition-all"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-6 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
          <h1 className="font-serif font-bold text-lg sm:text-2xl text-karobaari-darkGray">
            Shopping Cart ({items.length})
          </h1>
          <button
            type="button"
            onClick={() => {
              clearCart();
              setItems([]);
            }}
            className="text-[11px] sm:text-xs text-gray-500 hover:text-red-600 font-medium cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Delivery / Shipping Alert Tracker */}
        {isOnlyDigital && items.length > 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-emerald-900 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Digital Order: Instant Access &bull; 100% Zero Delivery Fee</span>
          </div>
        ) : (
          <>
            {subtotal > 0 && subtotal < freeShippingThreshold && !appliedVoucher?.is_free_shipping && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-amber-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <span>
                  Add <strong>Rs. {(freeShippingThreshold - subtotal).toLocaleString()}</strong> more to your order to unlock{" "}
                  <strong className="text-karobaari-maroon">100% FREE Delivery</strong>!
                </span>
              </div>
            )}
            {isFreeShipping && subtotal > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-emerald-900 flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Congratulations! You have unlocked FREE Delivery.</span>
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* CART ITEMS LIST (8 cols) */}
          <div className="lg:col-span-8 space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={getItemHref(item)}
                      className="text-xs sm:text-sm font-semibold text-karobaari-darkGray hover:text-karobaari-maroon line-clamp-1 block truncate"
                    >
                      {item.title}
                    </Link>
                    {item.variant_name && (
                      <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">
                        Option: {item.variant_name}
                      </span>
                    )}
                    <span className="text-xs font-bold text-karobaari-maroon font-sans block mt-0.5">
                      Rs. {item.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      type="button"
                      onClick={() => handleQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 text-xs font-bold cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-extrabold text-xs sm:text-sm text-karobaari-darkGray font-sans min-w-[75px] text-right">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY & VOUCHER (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Voucher Box */}
            <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-xs">
              <span className="text-xs font-bold text-karobaari-darkGray flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-karobaari-maroon" /> Apply Coupon
              </span>

              {appliedVoucher ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <strong className="font-mono">{appliedVoucher.code}</strong>
                      <span className="text-[10px] text-emerald-700 block">
                        {appliedVoucher.title}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                    title="Remove coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucher} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME30)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs uppercase font-mono font-medium focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
                  />
                  <button
                    type="submit"
                    className="bg-karobaari-maroon text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-karobaari-darkMaroon transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {voucherError && <p className="text-[10px] text-red-600 mt-1">{voucherError}</p>}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-2.5 text-xs">
              <h3 className="font-serif font-bold text-sm text-karobaari-darkGray border-b border-gray-100 pb-1.5">
                Summary
              </h3>

              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-karobaari-darkGray">Rs. {subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>- Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-karobaari-darkGray">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE Delivery</span>
                  ) : (
                    `Rs. ${shippingFee}`
                  )}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-sm text-karobaari-darkGray">Grand Total</span>
                <span className="font-extrabold text-base sm:text-lg text-karobaari-maroon font-sans">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="w-full bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow border border-karobaari-gold/40 transition-transform active:scale-95 flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 pt-1">
                <ShieldCheck className="w-3 h-3 text-green-600" />
                <span>Cash on Delivery (COD) Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
