import { RotateCcw, CheckCircle2, AlertOctagon, CreditCard, ShieldAlert } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="border-b border-gray-200 pb-5">
            <span className="text-[11px] font-bold text-karobaari-maroon uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
              Assurance &amp; Protection
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray mt-2">
              Return &amp; Refund Policy — Karobaari Hub &amp; Co.
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              We want you to be completely satisfied with your purchase from Karobaari Hub &amp; Co. Please read our return and refund guidelines below to understand your rights and our procedures:
            </p>
          </div>

          <div className="space-y-5">
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <RotateCcw className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Return Window</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Eligible physical products purchased through <strong>KarobaariHub</strong> can be returned within <strong>7 days of delivery</strong>.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Condition for Returns</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                To qualify for a return, the item must be unused, in its original packaging, and in the same condition that you received it, complete with all tags and accessories.
              </p>
            </section>

            <section className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0" />
                <h2 className="font-serif text-amber-950">Non-Returnable Items</h2>
              </div>
              <p className="text-amber-900 text-xs sm:text-sm leading-relaxed">
                Due to the nature of digital goods, digital e-books, online learning courses, and video masterclasses are strictly non-refundable and non-returnable once access or download links have been provided. Real estate transactions handled through Prism Real Estate are governed by separate legal agreements and terms signed at the time of booking or registry transfer.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <CreditCard className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Refund Process</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Once your returned physical item is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed through your preferred banking channel or mobile account within a few business days.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Shipping Costs for Returns</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Customers are generally responsible for paying their own shipping costs for returning items, unless the item delivered was damaged, defective, or incorrect.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}