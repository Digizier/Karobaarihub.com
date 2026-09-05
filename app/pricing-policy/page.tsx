import Link from "next/link";
import { ShieldCheck, ShoppingCart, Building2, CheckCheck, HelpCircle, Phone } from "lucide-react";

export default function PricingPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6">
            <span className="text-[11px] font-bold text-karobaari-maroon uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
              Zero Hidden Charges Commitment
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray mt-2">
              Transparent Pricing &amp; Hidden Charges Policy — Karobaari Hub &amp; Co.
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-3 leading-relaxed">
              To maintain absolute trust and transparency across both our e-commerce platform (<strong>Karobaari Hub</strong>) and our real estate agency (<strong>Prism Real Estate</strong>), we enforce a strict Transparent Pricing Policy. All associated costs, fees, and taxes must be explicitly communicated and agreed upon prior to finalizing any transaction:
            </p>
          </div>

          {/* Core Clauses */}
          <div className="space-y-5">
            {/* Clause 1 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <ShoppingCart className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">E-Commerce Delivery &amp; Service Charges</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                All product prices listed on our platform are clear. Shipping and delivery charges are calculated and displayed explicitly at checkout before order confirmation, ensuring customers never face unexpected fees upon delivery.
              </p>
            </section>

            {/* Clause 2 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Building2 className="w-4 h-4 text-karobaari-gold shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Real Estate Society &amp; Government Taxes</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                For all property transactions managed by Prism Real Estate, all applicable taxes, stamp duties, capital value taxes (CVT), and society transfer fees must be itemized in advance.
              </p>
            </section>

            {/* Clause 3 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Responsibility Allocation</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Every property booking or sales agreement will explicitly specify whether the respective transfer charges and government dues are the liability of the buyer or the seller, eliminating any ambiguity or post-deal disputes.
              </p>
            </section>
          </div>

          {/* Support Strip */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-karobaari-gold">
                Questions About Fees or Invoicing?
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Reach out to our billing and customer care team anytime for transparent clarification.
              </p>
            </div>
            <a
              href="mailto:karobaarihub@gmail.com"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-xs shrink-0 border border-white/20 shadow flex items-center gap-2 transition-colors"
            >
              <span>Email: karobaarihub@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
