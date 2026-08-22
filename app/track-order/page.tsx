"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getOrderByTracking } from "@/lib/db";
import { Order } from "@/lib/types";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const result = await getOrderByTracking(q.trim());
    setOrder(result);
    setLoading(false);
  };

  const steps: Order["order_status"][] = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

  const getStepIndex = (status: Order["order_status"]) => {
    const idx = steps.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="w-12 h-12 rounded-full bg-karobaari-maroon text-white flex items-center justify-center mx-auto mb-3 shadow">
            <Package className="w-6 h-6 text-karobaari-gold" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-karobaari-darkGray">
            Track Your Order
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Enter your Order Number (e.g. KB-94821) or phone number to check delivery status.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Order # or Phone Number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-karobaari-darkGray focus:outline-none focus:ring-1 focus:ring-karobaari-maroon"
              />
            </div>
            <button
              type="submit"
              className="bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-semibold text-xs px-6 py-2.5 rounded-lg transition-colors"
            >
              Track Order
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-karobaari-maroon border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-3">Looking up order records...</p>
          </div>
        ) : order ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-400">Order Reference:</span>
                  <h3 className="font-mono font-bold text-lg text-karobaari-maroon">
                    {order.order_number}
                  </h3>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">
                    Status: {order.order_status}
                  </span>
                </div>
              </div>

              <div className="pt-6 pb-2">
                <div className="grid grid-cols-5 gap-1 text-center">
                  {steps.map((st, idx) => {
                    const activeIdx = getStepIndex(order.order_status);
                    const isDone = idx <= activeIdx;
                    return (
                      <div key={st} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                            isDone
                              ? "bg-karobaari-maroon text-white shadow"
                              : "bg-gray-100 text-gray-400 border border-gray-200"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-medium ${isDone ? "text-karobaari-maroon font-bold" : "text-gray-400"}`}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <h4 className="font-serif font-bold text-sm text-karobaari-darkGray mb-3 border-b border-gray-100 pb-1.5">
                  Delivery Details
                </h4>
                <div className="space-y-1.5 text-gray-600">
                  <p><strong className="text-gray-800">Customer:</strong> {order.customer_name}</p>
                  <p><strong className="text-gray-800">Phone:</strong> {order.customer_phone}</p>
                  <p><strong className="text-gray-800">Address:</strong> {order.delivery_address}, {order.city}, {order.province}</p>
                  <p><strong className="text-gray-800">Payment:</strong> {order.payment_method} ({order.payment_status})</p>
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-karobaari-darkGray mb-3 border-b border-gray-100 pb-1.5">
                  Ordered Items
                </h4>
                <div className="space-y-2">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-gray-700">
                      <span>{it.product_name_snapshot} &times; {it.quantity}</span>
                      <span className="font-bold">Rs. {Number(it.line_total).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-karobaari-maroon">
                    <span>Total Amount:</span>
                    <span>Rs. {Number(order.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : searched ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h3 className="font-serif font-bold text-base text-karobaari-darkGray">
              No Order Found
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Please double check your Order Number (e.g. KB-94821) or phone number.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}