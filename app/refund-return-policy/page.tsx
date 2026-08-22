export default function RefundPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray border-b border-gray-200 pb-4">
            Refund &amp; Return Policy
          </h1>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">1. 7-Day Return Window</h2>
            <p>If you receive a defective, damaged, or incorrect physical product, you may request a free return or exchange within 7 days of package delivery.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">2. Return Eligibility</h2>
            <p>The product must remain unused, with original packaging, tags, accessories, and warranty cards intact.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">3. Refund Processing</h2>
            <p>Approved refunds are disbursed via JazzCash, EasyPaisa, or direct Bank Transfer within 3-5 business days upon item return receipt.</p>
          </section>
        </div>
      </div>
    </div>
  );
}