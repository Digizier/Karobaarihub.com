"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  MapPin,
  Home,
  Briefcase,
  Lock,
  ArrowRight,
  Tag,
  CheckCircle2,
  X,
  Truck,
  Building,
} from "lucide-react";
import {
  getCartItems,
  getCartSubtotal,
  clearCart,
  getAppliedVoucherCode,
  saveAppliedVoucherCode,
} from "@/lib/cart";
import { CartItem, Voucher, SiteSettings } from "@/lib/types";
import { createOrder, getVouchers, getSiteSettings } from "@/lib/db";
import { initialSiteSettings } from "@/lib/mockData";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("Punjab");
  const [city, setCity] = useState("Rawalpindi");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [addressLabel, setAddressLabel] = useState<"Home" | "Office">("Home");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "JazzCash" | "EasyPaisa" | "Bank Transfer">("COD");
  const [customerNotes, setCustomerNotes] = useState("");

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState("");

  const loadData = () => {
    const cart = getCartItems();
    if (cart.length === 0) {
      router.push("/cart");
    } else {
      setItems(cart);
    }

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
          setVoucherInput(match.code);
        }
      }
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener("kb_settings_updated", loadData);
    return () => window.removeEventListener("kb_settings_updated", loadData);
  }, [router]);

  const subtotal = getCartSubtotal(items);
  const freeShippingThreshold = siteSettings.free_shipping_threshold || 3000;
  const standardShippingFee = siteSettings.standard_shipping_fee || 199;

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError("");

    if (!voucherInput.trim()) {
      setVoucherError("Please enter a coupon code.");
      return;
    }

    const code = voucherInput.trim().toUpperCase();
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
    setVoucherInput("");
    setVoucherError("");
    saveAppliedVoucherCode(null);
  };

  const discountAmount = appliedVoucher
    ? appliedVoucher.discount_type === "percentage"
      ? Math.min(appliedVoucher.max_discount || 999999, (subtotal * appliedVoucher.discount_value) / 100)
      : appliedVoucher.discount_value
    : 0;

  const isFreeShipping = appliedVoucher?.is_free_shipping || subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : standardShippingFee;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const result = await createOrder(
        {
          customer_name: fullName.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || undefined,
          province,
          city,
          area: area.trim() || undefined,
          delivery_address: address.trim(),
          address_label: addressLabel,
          subtotal,
          voucher_code: appliedVoucher?.code || undefined,
          discount_amount: discountAmount,
          shipping_fee: shippingFee,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: "Pending",
          order_status: "Pending",
          customer_notes: customerNotes.trim() || undefined,
        },
        items.map((it) => ({
          product_id: it.product_id,
          product_name_snapshot: it.title,
          variant_snapshot: it.variant_name,
          unit_price: it.price,
          quantity: it.quantity,
          line_total: it.price * it.quantity,
        }))
      );

      if (result.success) {
        clearCart();
        saveAppliedVoucherCode(null);
        router.push(`/order-success?order=${result.orderNumber}&token=${result.trackingToken}`);
      } else {
        setErrorMsg(result.error || "Failed to place order.");
        setIsSubmitting(false);
      }
    } catch {
      setErrorMsg("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const citiesByProvince: Record<string, string[]> = {
    Punjab: ["Rawalpindi", "Islamabad", "Lahore", "Faisalabad", "Multan", "Gujranwala", "Sialkot", "Taxila", "Wah Cantt"],
    Sindh: ["Karachi", "Hyderabad", "Sukkur", "Larkana"],
    "Khyber Pakhtunkhwa": ["Peshawar", "Abbottabad", "Mardan", "Swat"],
    Islamabad: ["Islamabad (Federal Capital)"],
    Balochistan: ["Quetta", "Gwadar"],
  };

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-6 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <h1 className="font-serif font-bold text-lg sm:text-2xl text-karobaari-darkGray mb-4 pb-2 border-b border-gray-200">
          Checkout &amp; Order
        </h1>

        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
          {/* LEFT: FORM (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <MapPin className="w-4 h-4 text-karobaari-maroon" />
                <h2 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray">
                  1. Delivery Address (Pakistan)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-karobaari-maroon font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-karobaari-maroon font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Province *</label>
                  <select
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setCity(citiesByProvince[e.target.value]?.[0] || "");
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-karobaari-maroon font-medium"
                  >
                    {Object.keys(citiesByProvince).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">City *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-karobaari-maroon font-medium"
                  >
                    {(citiesByProvince[province] || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Area / Sector / Colony</label>
                  <input
                    type="text"
                    placeholder="e.g. Shahpur, Saddar, DHA, Gulshan"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Complete Street / House Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House / Flat #, Street #, Landmark / Road..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
                  />
                </div>

                {/* Address Type Interactive Cards */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1.5">Address Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setAddressLabel("Home")}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        addressLabel === "Home"
                          ? "border-karobaari-maroon bg-red-50/70 ring-1 ring-karobaari-maroon shadow-2xs"
                          : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          addressLabel === "Home"
                            ? "bg-karobaari-maroon text-white shadow-xs"
                            : "bg-white border border-gray-200 text-gray-500"
                        }`}
                      >
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-gray-900 block leading-tight">Home Address</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Delivery All Day (9am - 9pm)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddressLabel("Office")}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        addressLabel === "Office"
                          ? "border-karobaari-maroon bg-red-50/70 ring-1 ring-karobaari-maroon shadow-2xs"
                          : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          addressLabel === "Office"
                            ? "bg-karobaari-maroon text-white shadow-xs"
                            : "bg-white border border-gray-200 text-gray-500"
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-gray-900 block leading-tight">Office / Commercial</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Business Hours (9am - 6pm)</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Delivery Instructions / Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery, leave with guard..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-2.5">
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <Lock className="w-4 h-4 text-karobaari-maroon" />
                <h2 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray">
                  2. Payment Method
                </h2>
              </div>

              <div className="space-y-2 text-xs">
                {/* COD Option */}
                {siteSettings.cod_enabled !== false && (
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                    paymentMethod === "COD" ? "border-karobaari-maroon bg-red-50/60 font-bold text-karobaari-darkMaroon" : "border-gray-200"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="text-karobaari-maroon"
                      />
                      <div>
                        <span>Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-gray-500 font-normal block">Pay cash to courier upon parcel delivery</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-karobaari-gold text-karobaari-darkGray font-bold px-1.5 py-0.5 rounded">Recommended</span>
                  </label>
                )}

                {/* JazzCash Option */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  paymentMethod === "JazzCash" ? "border-karobaari-maroon bg-red-50/60 font-bold text-karobaari-darkMaroon" : "border-gray-200"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "JazzCash"}
                      onChange={() => setPaymentMethod("JazzCash")}
                      className="text-karobaari-maroon"
                    />
                    <div>
                      <span>JazzCash Mobile Account</span>
                      <span className="text-[10px] text-gray-500 font-normal block">
                        {siteSettings.jazzcash_number || "0335 9939702"} (Title: {siteSettings.jazzcash_title || "Karobaari Hub"})
                      </span>
                    </div>
                  </div>
                </label>

                {/* EasyPaisa Option */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  paymentMethod === "EasyPaisa" ? "border-karobaari-maroon bg-red-50/60 font-bold text-karobaari-darkMaroon" : "border-gray-200"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "EasyPaisa"}
                      onChange={() => setPaymentMethod("EasyPaisa")}
                      className="text-karobaari-maroon"
                    />
                    <div>
                      <span>EasyPaisa Mobile Account</span>
                      <span className="text-[10px] text-gray-500 font-normal block">
                        {siteSettings.easypaisa_number || "0335 9939702"} (Title: {siteSettings.easypaisa_title || "Karobaari Hub"})
                      </span>
                    </div>
                  </div>
                </label>

                {/* Bank Transfer Option */}
                {siteSettings.bank_account_number && (
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                    paymentMethod === "Bank Transfer" ? "border-karobaari-maroon bg-red-50/60 font-bold text-karobaari-darkMaroon" : "border-gray-200"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "Bank Transfer"}
                        onChange={() => setPaymentMethod("Bank Transfer")}
                        className="text-karobaari-maroon"
                      />
                      <div>
                        <span>Bank Direct Transfer ({siteSettings.bank_name || "Meezan Bank"})</span>
                        <span className="text-[10px] text-gray-500 font-normal block">
                          Title: {siteSettings.bank_account_title} | IBAN: {siteSettings.bank_account_number}
                        </span>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: SUMMARY (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs text-xs space-y-3">
              <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray border-b border-gray-100 pb-1.5">
                Order Items ({items.length})
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <Image src={item.thumbnail_url} alt={item.title} fill unoptimized className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-karobaari-darkGray truncate block">{item.title}</span>
                        <span className="text-[10px] text-gray-500">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-karobaari-darkGray font-sans whitespace-nowrap">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1.5">
                <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-karobaari-maroon" />
                  <span>Discount Coupon &amp; Voucher</span>
                </span>

                {appliedVoucher ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <strong className="font-mono">{appliedVoucher.code}</strong>
                        <span className="text-[10px] text-emerald-700 block">
                          {appliedVoucher.title} ({appliedVoucher.discount_type === "percentage" ? `${appliedVoucher.discount_value}% OFF` : `Rs. ${appliedVoucher.discount_value} OFF`})
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
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Enter Coupon (e.g. WELCOME30)"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase font-semibold focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      className="bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {voucherError && (
                  <p className="text-[10px] text-red-600 font-medium">{voucherError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 pt-1.5 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-karobaari-darkGray">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery / Courier</span>
                  <span className="font-semibold text-karobaari-darkGray">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE Delivery</span>
                    ) : (
                      `Rs. ${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-karobaari-darkGray">Grand Total Amount</span>
                  <span className="font-extrabold text-base sm:text-xl text-karobaari-maroon font-sans">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow border border-karobaari-gold/40 transition-transform active:scale-95 flex items-center justify-center gap-1.5 mt-3 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Placing Order...</span>
                ) : (
                  <>
                    <span>Place Order | Rs. {totalAmount.toLocaleString()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 pt-1 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>100% Safe COD Checkout</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
