import { ShieldCheck, Lock, UserCheck, EyeOff, Cookie, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="border-b border-gray-200 pb-5">
            <span className="text-[11px] font-bold text-karobaari-maroon uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
              Data Safety &amp; Trust
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray mt-2">
              Privacy Policy — Karobaari Hub &amp; Co.
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              At Karobaari Hub &amp; Co., we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website, karobaarihub.com, use our e-commerce platform, engage with Prism Real Estate services, or enroll in our digital courses.
            </p>
          </div>

          <div className="space-y-5">
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <FileText className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Information We Collect</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                We may collect personal information such as your name, phone number (including your business WhatsApp number), email address, shipping address, and payment details when you place an order, book a property, or register for an online course.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <UserCheck className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Use of Information</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Your data is used strictly to process orders, manage deliveries, schedule real estate consultations, grant access to digital e-books and courses, and provide responsive customer support.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Lock className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Data Protection</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                We implement robust security measures to maintain the safety of your personal information against unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <EyeOff className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Third-Party Sharing</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except for trusted courier partners and service providers necessary to fulfill your orders or business requests.
              </p>
            </section>

            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Cookie className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Cookies</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Our website may use cookies to enhance your browsing experience, analyze site traffic, and remember your preferences.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}