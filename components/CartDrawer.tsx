"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  getCartSubtotal,
  getCartCount,
  closeCartDrawer,
  getAppliedVoucherCode,
  saveAppliedVoucherCode,
} from "@/lib/cart";
import { CartItem, Voucher, SiteSettings } from "@/lib/types";
import { getVouchers, getSiteSettings } from "@/lib/db";
import { initialSiteSettings } from "@/lib/mockData";

export default function CartDrawer() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState("");

  const refreshCart = () => {
    const currentItems = getCartItems();
    setItems(currentItems);
  };

  const refreshSettings = () => {
    getSiteSettings().then((s) => {
      if (s) setSiteSettings(s);
    });
  };

  useEffect(() => {
    refreshCart();
    refreshSettings();
    getVouchers().then(setVouchers);

    const handleOpen = () => {
      refreshCart();
      refreshSettings();
      setIsOpen(true);
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    const handleCartUpdate = () => {
      refreshCart();
    };

    const handleSettingsUpdate = () => {
      refreshSettings();
    };

    window.addEventListener("kb_open_cart_drawer", handleOpen);
    window.addEventListener("kb_close_cart_drawer", handleClose);
    window.addEventListener("kb_cart_updated", handleCartUpdate);
    window.addEventListener("kb_settings_updated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("kb_open_cart_drawer", handleOpen);
      window.removeEventListener("kb_close_cart_drawer", handleClose);
      window.removeEventListener("kb_cart_updated", handleCartUpdate);
      window.removeEventListener("kb_settings_updated", handleSettingsUpdate);
    };
  }, []);

  // Sync applied voucher from localStorage whenever vouchers list or items change
  useEffect(() => {
    const savedCode = getAppliedVoucherCode();
    if (savedCode && vouchers.length > 0) {
      const match = vouchers.find(
        (v) => v.code.toUpperCase() === savedCode.toUpperCase() && v.is_active
      );
      if (match) {
        setAppliedVoucher(match);
        setVoucherCodeInput(match.code);
      } else {
        setAppliedVoucher(null);
      }
    } else if (!savedCode) {
      setAppliedVoucher(null);
    }
  }, [vouchers, items]);

  const subtotal = getCartSubtotal(items);
  const totalCount = getCartCount(items);
  const freeShippingThreshold = siteSettings.free_shipping_threshold || 3000;
  const standardShippingFee = siteSettings.standard_shipping_fee || 199;

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError("");

    if (!voucherCodeInput.trim()) {
      setVoucherError("Please enter a coupon code.");
      return;
    }

    const code = voucherCodeInput.trim().toUpperCase();
    const found = vouchers.find((v) => v.code.toUpperCase() === code && v.is_active);

    if (!found) {
      setVoucherError(`Coupon "${code}" is invalid or expired.`);
      return;
    }

    if (subtotal < found.min_spend) {
      setVoucherError(
        `Minimum spend of Rs. ${found.min_spend.toLocaleString()} required for this coupon.`
      );
      return;
    }

    setAppliedVoucher(found);
    saveAppliedVoucherCode(found.code);
    setVoucherError("");
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput("");
    setVoucherError("");
    saveAppliedVoucherCode(null);
  };

  const discountAmount = appliedVoucher
    ? appliedVoucher.discount_type === "percentage"
      ? Math.min(
          appliedVoucher.max_discount || 999999,
          (subtotal * appliedVoucher.discount_value) / 100
        )
      : appliedVoucher.discount_value
    : 0;

  const isOnlyDigital = items.length > 0 && items.every((i) => i.type === "digital_book" || i.type === "course");
  const isFreeShipping =
    isOnlyDigital || appliedVoucher?.is_free_shipping || subtotal >= freeShippingThreshold || items.length === 0;
  const shippingFee = isFreeShipping ? 0 : standardShippingFee;
  const estimatedTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const getItemHref = (item: CartItem) => {
    if (item.type === "course") return `/courses/?slug=${item.slug}`;
    if (item.type === "digital_book") return `/digital-books/?slug=${item.slug}`;
    return `/product/?slug=${item.slug}`;
  };

  const handleProceedCheckout = () => {
    setIsOpen(false);
    closeCartDrawer();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        />
      )}

      {/* Slide-out Drawer Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-karobaari-maroon text-white p-4 flex items-center justify-between border-b-2 border-karobaari-gold shadow-xs">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-karobaari-gold" />
            <h2 className="font-serif font-bold text-base sm:text-lg text-white">
              My Shopping Cart
            </h2>
            <span className="bg-karobaari-gold text-karobaari-darkGray font-extrabold text-xs px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-black/20 rounded-lg transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delivery / Shipping Alert Tracker */}
        {isOnlyDigital && items.length > 0 ? (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-[11px] text-emerald-900 flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Digital Order: Instant Access &bull; 100% Zero Delivery Fee</span>
          </div>
        ) : (
          <>
            {subtotal > 0 && subtotal < freeShippingThreshold && !appliedVoucher?.is_free_shipping && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-karobaari-maroon flex-shrink-0" />
                <span>
                  Add <strong>Rs. {(freeShippingThreshold - subtotal).toLocaleString()}</strong> more to get{" "}
                  <strong className="text-karobaari-maroon">FREE Delivery</strong>!
                </span>
              </div>
            )}

            {isFreeShipping && subtotal > 0 && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-[11px] text-emerald-900 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Congratulations! You have unlocked FREE Delivery.</span>
              </div>
            )}
          </>
        )}

        {/* Drawer Content: Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-sm text-gray-800">
                Your Cart is Currently Empty
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Browse our marketplace products, electronics, courses, and e-books.
              </p>
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 bg-karobaari-maroon text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-karobaari-darkMaroon transition-all"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                  <Image
                    src={item.thumbnail_url || "/assets/cloth-stand-1.jpeg"}
                    alt={item.title || "Cart item"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={getItemHref(item)}
                    onClick={() => setIsOpen(false)}
                    className="font-semibold text-xs text-gray-900 hover:text-karobaari-maroon line-clamp-1 block truncate"
                  >
                    {item.title}
                  </Link>
                  {item.variant_name && (
                    <span className="text-[10px] text-gray-500 block truncate">
                      Option: {item.variant_name}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-karobaari-maroon font-sans">
                      Rs. {item.price.toLocaleString()}
                    </span>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={() => {
                          updateCartQuantity(item.id, item.quantity - 1);
                          refreshCart();
                        }}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 text-xs font-bold cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          updateCartQuantity(item.id, item.quantity + 1);
                          refreshCart();
                        }}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => {
                    removeFromCart(item.id);
                    refreshCart();
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer (Coupons + Calculation Summary + Checkout Button) */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50/90 p-4 space-y-3">
            {/* Coupon Code Section */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
              <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-karobaari-maroon" />
                <span>Have a Discount Coupon?</span>
              </span>

              {appliedVoucher ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <strong className="font-mono">{appliedVoucher.code}</strong>
                      <span className="text-[10px] text-emerald-700 block">
                        {appliedVoucher.title} applied!
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
                    placeholder="Enter code (e.g. WELCOME30)"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase font-semibold focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
                  />
                  <button
                    type="submit"
                    className="bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {voucherError && (
                <p className="text-[10px] text-red-600 font-medium">{voucherError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal ({totalCount} items):</span>
                <span className="font-semibold text-gray-900">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>- Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Delivery:</span>
                <span className="font-semibold text-gray-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `Rs. ${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-karobaari-darkGray pt-2 border-t border-gray-200">
                <span>Estimated Total:</span>
                <span className="text-base font-extrabold text-karobaari-maroon font-sans">
                  Rs. {estimatedTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleProceedCheckout}
                className="w-full bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow border border-karobaari-gold/40 transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="font-semibold text-karobaari-maroon hover:underline flex items-center gap-0.5"
                >
                  <span>View Full Cart Page</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
