import Link from "next/link";
import { Users, ShieldCheck, DollarSign, PackageCheck, Wallet, RotateCcw, AlertTriangle, Phone } from "lucide-react";

export default function ResellerPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6">
            <span className="text-[11px] font-bold text-karobaari-maroon uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
              Partnership &amp; Earning Guidelines
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray mt-2">
              Reseller Policy &amp; Guidelines — Karobaari Hub &amp; Co.
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-3 leading-relaxed">
              Welcome to the <strong>Karobaari Hub Reseller Community</strong>! We value your partnership and are committed to helping you grow your business and earn sustainable profits. To ensure transparency, smooth operations, and a professional working relationship, all registered resellers must adhere to the following policy guidelines:
            </p>
          </div>

          {/* 6 Guidelines */}
          <div className="space-y-5">
            {/* Rule 1 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">1. Account &amp; Identity Verification</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Resellers must provide accurate personal and business details, including an active WhatsApp number (
                <a href="https://wa.me/923359939702" className="text-karobaari-maroon font-bold underline">
                  +92 335 9939702
                </a>
                ) and a valid delivery address, to ensure seamless communication and order processing.
              </p>
            </section>

            {/* Rule 2 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <DollarSign className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">2. Profit Margins &amp; Pricing</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Resellers are free to set their selling price above the wholesale/base price provided in our official catalog. Your profit margin is the direct difference between your selling price to the end customer and our designated wholesale price.
              </p>
            </section>

            {/* Rule 3 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <PackageCheck className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">3. Order Booking &amp; Fulfillment</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                All customer orders must be booked through our designated channels with accurate customer names, phone numbers, and complete shipping addresses. Karobaari Hub will handle the packaging and nationwide shipping directly to your customers.
              </p>
            </section>

            {/* Rule 4 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Wallet className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">4. Payout Cycles</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Reseller profit margins and commissions are processed and cleared according to our scheduled payout cycles (typically after successful delivery and the completion of the customer return window). Payouts are transferred securely via bank transfer, JazzCash, or EasyPaisa.
              </p>
            </section>

            {/* Rule 5 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <RotateCcw className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">5. Order Cancellations &amp; Returns</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                If a customer cancels an order before dispatch, no penalty applies. If a product is returned due to a defect, damage, or genuine customer refusal within our 7-day return policy, the item will be sent back to our inventory. In cases of returned or canceled orders, respective profit margins or commissions for that specific transaction will not be credited or will be reversed.
              </p>
            </section>

            {/* Rule 6 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">6. Code of Conduct</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Resellers must maintain professional behavior while marketing Karobaari Hub products. Misrepresentation of product quality, fake promises, or unauthorized use of our copyrighted digital materials is strictly prohibited and may lead to suspension from the reseller network.
              </p>
            </section>
          </div>

          {/* Join Community CTA */}
          <div className="bg-gradient-to-r from-karobaari-maroon to-karobaari-darkMaroon text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg">Want to Join the Reseller Network?</h3>
              <p className="text-xs text-gray-200 mt-1">Start reselling without inventory investment. We pack and ship for you.</p>
            </div>
            <a
              href="https://wa.me/923359939702?text=Hello%20Karobaari%20Hub,%20I%20want%20to%20join%20your%20Reseller%20Network"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-karobaari-gold hover:bg-amber-400 text-karobaari-darkGray font-extrabold px-5 py-2.5 rounded-xl text-xs shrink-0 shadow flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Join Reseller WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
