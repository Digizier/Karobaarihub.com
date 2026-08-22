import Image from "next/image";
import Link from "next/link";
import { Building2, ShieldCheck, ShoppingBag, GraduationCap, Award, PhoneCall } from "lucide-react";
import Logo from "@/components/Logo";

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="text-center pb-6 border-b border-gray-100">
            <Logo variant="karobaari" className="justify-center mb-4" />
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-karobaari-darkGray">
              About Karobaari Hub &amp; Prism Real Estate
            </h1>
            <p className="text-xs text-gray-500 mt-2">
              Empowering Pakistani Commerce, Real Estate Investors &amp; Digital Entrepreneurs Since 1998
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-karobaari-darkGray">
              Our Vision &amp; Heritage
            </h2>
            <p>
              Founded with the vision of establishing an authentic, frictionless commerce bridge across Pakistan, <strong>Karobaari Hub</strong> integrates multi-category marketplace products, heavy industrial sublimation printing machines, luxury property consultancy through <strong>Prism Real Estate</strong>, and high-impact digital academies.
            </p>
            <p>
              Headquartered at Main Stop Shahpur, Adyala Road, Rawalpindi, we serve thousands of retail shoppers and serious real estate investors nationwide with 100% genuine guarantees, direct WhatsApp support, and cash on delivery logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <ShoppingBag className="w-6 h-6 text-karobaari-maroon mx-auto mb-2" />
              <h3 className="font-serif font-bold text-sm text-karobaari-darkGray mb-1">E-Commerce Marketplace</h3>
              <p className="text-gray-500 text-[11px]">12+ verified physical product categories with fast COD delivery.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <Building2 className="w-6 h-6 text-karobaari-gold mx-auto mb-2" />
              <h3 className="font-serif font-bold text-sm text-karobaari-darkGray mb-1">Prism Real Estate</h3>
              <p className="text-gray-500 text-[11px]">Direct registry plots, luxury houses, and commercial investment advisory.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <GraduationCap className="w-6 h-6 text-purple-700 mx-auto mb-2" />
              <h3 className="font-serif font-bold text-sm text-karobaari-darkGray mb-1">Academy &amp; Books</h3>
              <p className="text-gray-500 text-[11px]">Practical video masterclasses and localized business blueprints.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}