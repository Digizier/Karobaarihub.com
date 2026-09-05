import Link from "next/link";
import {
  ShoppingBag,
  Building2,
  GraduationCap,
  BookOpen,
  Phone,
  Mail,
  Globe,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/components/Logo";

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-12 shadow-sm space-y-10 text-gray-700 leading-relaxed">
          {/* Header */}
          <div className="text-center pb-8 border-b border-gray-100">
            <Logo variant="karobaari" className="justify-center mb-5" />
            <span className="text-[11px] font-bold text-karobaari-maroon uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-100">
              Welcome to Karobaari Hub &amp; Co.
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-4xl text-karobaari-darkGray mt-3">
              About Us — Karobaari Hub &amp; Co.
            </h1>
            <p className="text-sm sm:text-base font-medium text-gray-500 mt-2 max-w-2xl mx-auto">
              Your Ultimate Gateway to Commerce, Property Investment, and Digital Mastery.
            </p>
          </div>

          {/* Intro Vision */}
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed bg-amber-50/50 rounded-2xl p-5 sm:p-7 border border-amber-100">
            <p>
              Founded with a vision to empower modern entrepreneurs, investors, and digital learners,{" "}
              <strong className="text-karobaari-darkGray font-bold">Karobaari Hub &amp; Co.</strong> operates as a
              dynamic multi-niche enterprise.
            </p>
            <p>
              Backed by a solid decade of professional business experience, we bring trust, transparency, and top-tier
              quality across four core business verticals designed to foster growth and success in Pakistan&apos;s
              evolving economy.
            </p>
          </div>

          {/* 4 Core Business Pillars */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Sparkles className="w-5 h-5 text-karobaari-maroon" />
              <h2 className="font-serif font-bold text-lg sm:text-xl text-karobaari-darkGray">
                Our 4 Core Business Pillars
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pillar 1 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:border-karobaari-maroon/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-karobaari-maroon mb-3.5">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray mb-2">
                    1. KarobaariHub (E-Commerce Online Shopping)
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Our e-commerce retail platform brings thousands of quality products directly to your doorstep. From
                    everyday lifestyle essentials and tech gadgets to modern machinery and retail merchandise, Karobaari
                    Hub delivers a seamless, safe, and reliable online shopping experience backed by fast nationwide
                    delivery and a strong reseller community network across Pakistan.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <Link href="/shop" className="text-xs font-bold text-karobaari-maroon hover:underline">
                    Explore Marketplace &rarr;
                  </Link>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:border-karobaari-gold/60 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-karobaari-gold mb-3.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray mb-2">
                    2. Prism Real Estate (Real Estate Agency)
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    With years of hands-on market expertise in Rawalpindi and Islamabad, Prism Real Estate is your most
                    trusted property partner. We specialize in verified residential plots, commercial properties, and
                    ready-to-move-in homes (such as houses in Shahpur and Adyala Road). We take pride in offering 100%
                    transparent documentation, zero hidden charges, and professional property consultancy to secure your
                    investments.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <Link href="/real-estate" className="text-xs font-bold text-karobaari-darkMaroon hover:underline">
                    View Verified Properties &rarr;
                  </Link>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:border-purple-300 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 mb-3.5">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray mb-2">
                    3. Professional Online Courses &amp; Masterclasses
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    In the digital age, skills are the biggest asset. We provide comprehensive, result-oriented online
                    training courses and masterclasses covering the most lucrative digital platforms. Learn step-by-step
                    monetization and scaling strategies for YouTube, Instagram, TikTok, Amazon, Facebook, and other
                    top-tier online earning avenues to build a sustainable digital income.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <Link href="/courses" className="text-xs font-bold text-purple-700 hover:underline">
                    Browse Courses &rarr;
                  </Link>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:border-blue-300 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 mb-3.5">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-karobaari-darkGray mb-2">
                    4. Digital E-Books &amp; Educational Guides
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Accelerate your learning curve with our exclusive collection of practical digital e-books and
                    business guides. Authored to provide actionable strategies, our e-books cover high-ticket business
                    skills, e-commerce dropshipping secrets, and digital marketing blueprints tailored for aspiring
                    Pakistani professionals and creators.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <Link href="/digital-books" className="text-xs font-bold text-blue-700 hover:underline">
                    Browse Digital E-Books &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contact / Get In Touch Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="font-serif font-bold text-base sm:text-lg text-karobaari-gold">
              Get in Touch with Us
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <a
                href="https://karobaarihub.com"
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                <Globe className="w-4 h-4 text-karobaari-gold shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Official Website</span>
                  <span className="font-semibold text-gray-200 truncate block">karobaarihub.com</span>
                </div>
              </a>

              <a
                href="https://wa.me/923359939702"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Business WhatsApp</span>
                  <span className="font-semibold text-gray-200 truncate block">+92 335 9939702</span>
                </div>
              </a>

              <a
                href="mailto:karobaarihub@gmail.com"
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Support Email</span>
                  <span className="font-semibold text-gray-200 truncate block">karobaarihub@gmail.com</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}