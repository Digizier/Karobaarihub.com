export default function ShippingPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray border-b border-gray-200 pb-4">
            Shipping &amp; Delivery Policy
          </h1>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">1. Delivery Coverage</h2>
            <p>We deliver physical marketplace items across all major cities and rural zones in Pakistan including Punjab, Sindh, Khyber Pakhtunkhwa, Islamabad Capital Territory, and Balochistan via verified courier partners.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">2. Delivery Timelines</h2>
            <p>Standard delivery takes 2 to 4 business days. Orders placed before 3:00 PM are dispatched on the same business day.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">3. Shipping Rates</h2>
            <p>Standard delivery fee is flat Rs. 199. Orders exceeding Rs. 3,000 or qualifying voucher promotions enjoy 100% Free Shipping.</p>
          </section>
        </div>
      </div>
    </div>
  );
}