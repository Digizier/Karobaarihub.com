export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray border-b border-gray-200 pb-4">
            Privacy Policy
          </h1>
          <p>At Karobaari Hub &amp; Prism Real Estate, we are committed to safeguarding our visitors&apos; privacy. This policy outlines how we process delivery information and contact records.</p>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">1. Information Collection</h2>
            <p>We only collect information strictly required for order fulfillment and visit scheduling (e.g. Full Name, Phone Number, Delivery Address).</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">2. Data Security &amp; Zero Selling</h2>
            <p>Your phone numbers and addresses are strictly protected and never shared or sold to third-party marketing brokers.</p>
          </section>
        </div>
      </div>
    </div>
  );
}