export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray border-b border-gray-200 pb-4">
            Terms of Service
          </h1>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">1. Acceptance of Terms</h2>
            <p>By accessing karobaarihub.com and placing guest orders or booking real estate visits, you agree to comply with these terms.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-base text-karobaari-darkGray">2. Real Estate Representation</h2>
            <p>All property listings displayed under Prism Real Estate represent bona fide properties verified for physical and registry authenticity.</p>
          </section>
        </div>
      </div>
    </div>
  );
}