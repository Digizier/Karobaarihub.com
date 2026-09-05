import Link from "next/link";
import { Building2, FileSignature, Receipt, CalendarCheck, MapPin, Scale, Phone } from "lucide-react";

export default function RealEstateBookingPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6">
            <span className="text-[11px] font-bold text-karobaari-gold uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Prism Real Estate Legal Standards
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray mt-2">
              Written Booking Agreements &amp; Bayana Policy — Prism Real Estate
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-3 leading-relaxed">
              Client ke sath real estate deals ko <strong>100% transparent, secure aur legally binding</strong> rakhne ke liye Prism Real Estate ke tamam transactions mein in standard rules aur written documentation ko lazmi follow kiya jaye:
            </p>
          </div>

          {/* 5 Clauses */}
          <div className="space-y-5">
            {/* Clause 1 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <FileSignature className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Mandatory Written Agreements</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Kisi bhi property deal (chahe woh Shahpur aur Adyala Road ke residential plots hon, ready-made houses hon ya commercial properties) mein kisi bhi qisam ki verbal commitment ya zubani baat par bharosa karne ke bajaye hamesha formal written agreement tayar kiya jaye aur client ke signatures liye jayen.
              </p>
            </section>

            {/* Clause 2 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Receipt className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Token &amp; Bayana Receipts</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Property booking ya token money/bayana lete ya dete waqt hamesha official stamped ya signed receipt jari ki jaye, jis par amount (words aur figures dono mein) wazeh likhi ho.
              </p>
            </section>

            {/* Clause 3 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <CalendarCheck className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Crystal Clear Payment Schedule</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Agreement aur receipt ke andar poora payment plan, installments ki dates (agar applicable hon), remaining balance ki raqam, aur final registry/transfer ki deadline bilkul wazeh (crystal clear) mention honi chahiye.
              </p>
            </section>

            {/* Clause 4 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <MapPin className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Complete Property Details</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Written document mein property ki exact dimensions, area (jaise Marla/Sq Ft), boundary markers, plot/house number, street number, aur society/location ka naam mukammal taur par darj hona chahiye taake future mein koi ambiguity ya dispute na rahay.
              </p>
            </section>

            {/* Clause 5 */}
            <section className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-karobaari-maroon font-bold text-sm">
                <Scale className="w-4 h-4 text-karobaari-maroon shrink-0" />
                <h2 className="font-serif text-karobaari-darkGray">Hidden Charges &amp; Taxes Clearance</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Agreement ke andar yeh point pehle se wazeh kar diya jaye ke society transfer fee, stamp duty, ya koi bhi government tax buyer pay karega ya seller, taake deal final hone ke waqt kisi misunderstanding ki gunjaish na bache.
              </p>
            </section>
          </div>

          {/* Legal Consultation Strip */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-karobaari-gold">
                Have Questions About Property Documentation?
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Consult with our verified legal &amp; property advisors in Shahpur, Adyala Road.
              </p>
            </div>
            <a
              href="https://wa.me/923359939702?text=Hello%20Prism%20Real%20Estate,%20I%20have%20an%20inquiry%20regarding%20Property%20Booking%20&%20Agreement"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shrink-0 shadow flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Property Advisor</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
