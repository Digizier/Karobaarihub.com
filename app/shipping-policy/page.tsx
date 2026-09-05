import Link from "next/link";
import { Truck, Clock, MapPin, Calculator, Search, Zap, ShieldCheck } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="border-b border-gray-200 pb-5">
            <span className="text-[11px] font-bold text-karobaari-maroon uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
              Customer Guidelines
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray mt-2">
              Shipping Policy — Karobaari Hub &amp; Co.
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              At Karobaari Hub &amp; Co., we strive to ensure that your orders—whether retail merchandise, physical products, or digital resources—reach you securely and efficiently. Please review our shipping guidelines below:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <MapPin className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Nationwide Delivery</h2>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                We offer reliable shipping across Pakistan for all physical products ordered through our e-commerce platform, <strong>KarobaariHub</strong>.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Clock className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Processing &amp; Dispatch Time</h2>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Orders are typically processed and handed over to our courier partners within <strong>24 to 48 hours</strong> of confirmation.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Truck className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Delivery Timelines</h2>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Standard delivery across major cities usually takes between <strong>2 to 4 business days</strong>, while remote locations may take slightly longer.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Calculator className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Shipping Charges</h2>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Delivery charges vary depending on the destination, weight, and size of the package. Any applicable delivery fees will be clearly shown at checkout before you confirm your order.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Search className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Order Tracking</h2>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                You can easily monitor the status of your shipment using the &ldquo;Track Order&rdquo; feature on our website,{" "}
                <Link href="/track-order" className="text-karobaari-maroon font-bold underline">
                  karobaarihub.com
                </Link>.
              </p>
            </section>

            <section className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Zap className="w-4 h-4 text-emerald-700 shrink-0" />
                <h2 className="font-serif text-emerald-950">Digital Products &amp; Courses</h2>
              </div>
              <p className="text-emerald-900 text-xs leading-relaxed">
                Digital e-books, online learning courses, and video masterclasses are delivered instantly or via access credentials provided upon successful payment confirmation, bypassing physical shipping altogether.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}