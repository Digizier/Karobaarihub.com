import Link from "next/link";
import { Building2, ShieldCheck, FileCheck, Landmark, PhoneCall, ArrowRight } from "lucide-react";

export default function RealEstateServicesPage() {
  const services = [
    {
      title: "Property Sale & Purchase Facilitation",
      desc: "Direct deal matchmaking between genuine buyers and sellers with zero inflated commissions and complete rate transparency.",
      icon: Building2,
    },
    {
      title: "Legal & Documentation Due Diligence",
      desc: "Thorough verification of Fard, Registry, Inteqal, Aks Shajra, and society NOC approvals before financial commitments.",
      icon: FileCheck,
    },
    {
      title: "Real Estate Investment Portfolio Advisory",
      desc: "Strategic guidance on short-term plot flips and high-yield rental commercial real estate in Rawalpindi & Islamabad expansion corridors.",
      icon: Landmark,
    },
    {
      title: "Construction & Architectural Consultancy",
      desc: "A-grade residential construction supervision, modern floor plan layouts, and structural quality compliance.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase text-karobaari-maroon tracking-wider">
            Prism Real Estate
          </span>
          <h1 className="font-serif font-bold text-3xl text-karobaari-darkGray mt-1">
            Our Professional Real Estate Services
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Delivering trusted advisory, legal assurance, and high-ROI opportunities across Rawalpindi and Islamabad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-karobaari-maroon text-karobaari-gold flex items-center justify-center flex-shrink-0 shadow">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-karobaari-darkGray mb-1.5">{s.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-karobaari-darkGray to-black text-white rounded-2xl p-8 text-center max-w-3xl mx-auto border-2 border-karobaari-gold">
          <h2 className="font-serif font-bold text-2xl text-white mb-2">Speak Directly with a Property Consultant</h2>
          <p className="text-xs text-gray-300 mb-6">
            Get personalized valuation for your house or plot in Shahpur, Adyala Road, DHA or Bahria Town.
          </p>
          <a
            href="https://wa.me/923359939702?text=Hello%20Prism%20Real%20Estate,%20I%20need%20property%20consultancy."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Connect on WhatsApp (+92 335 9939 702)</span>
          </a>
        </div>
      </div>
    </div>
  );
}