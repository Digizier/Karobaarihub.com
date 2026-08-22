"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, PhoneCall, ShoppingBag } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "KB-ORDER";
  const trackingToken = searchParams.get("token") || "";

  const whatsappMsg = encodeURIComponent(
    `Hello Karobaari Hub, I have placed an order with Order Number: ${orderNumber}. Please confirm dispatch.`
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="font-serif font-bold text-2xl text-karobaari-darkGray mb-1">
            Order Placed Successfully!
          </h1>
          <p className="text-xs text-gray-500 mb-6">
            Thank you for shopping with Karobaari Hub. Your order has been recorded and will be processed immediately.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Number:</span>
              <span className="font-mono font-bold text-karobaari-maroon">{orderNumber}</span>
            </div>
            {trackingToken && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tracking Reference:</span>
                <span className="font-mono text-gray-700">{trackingToken}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Payment:</span>
              <span className="font-semibold text-gray-700">Cash on Delivery (COD)</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`https://wa.me/923359939702?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Confirm Instantly via WhatsApp (+92 335 9939 702)</span>
            </a>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href={`/track-order?q=${orderNumber}`}
                className="py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <Package className="w-4 h-4" /> Track Order
              </Link>
              <Link
                href="/shop"
                className="py-2.5 rounded-xl bg-karobaari-maroon text-white text-xs font-semibold hover:bg-karobaari-darkMaroon flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" /> Keep Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}