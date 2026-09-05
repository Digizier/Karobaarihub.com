import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";

export default function RealEstateContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase text-karobaari-maroon tracking-wider">
            Get In Touch
          </span>
          <h1 className="font-serif font-bold text-3xl text-karobaari-darkGray mt-1">
            Prism Real Estate Head Office
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Visit our office or call our property advisors for appointments, inspections, and inquiries.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div className="space-y-6">
            <div>
              <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Office Address</span>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-karobaari-maroon flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-karobaari-darkGray text-sm block">Main Stop Shahpur</span>
                  <span className="text-gray-600">Adyala Road, Rawalpindi / Islamabad, Pakistan</span>
                </div>
              </div>
            </div>

            <div>
              <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Direct Hotline &amp; WhatsApp</span>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-karobaari-maroon flex-shrink-0" />
                <a href="tel:+923359939702" className="font-bold text-karobaari-darkGray text-sm hover:text-karobaari-maroon">
                  +92 335 9939 702
                </a>
              </div>
            </div>

            <div>
              <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Official Email</span>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-karobaari-maroon flex-shrink-0" />
                <a href="mailto:karobaarihub@gmail.com" className="font-semibold text-gray-700 hover:text-karobaari-maroon">
                  karobaarihub@gmail.com
                </a>
              </div>
            </div>

            <div>
              <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Office Hours</span>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-karobaari-maroon flex-shrink-0" />
                <span className="text-gray-600">Monday – Sunday: 9:00 AM – 9:00 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-karobaari-darkGray mb-2">
                Instant WhatsApp Consultation
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Have a quick question about property prices, plot availability, or visit schedules? Send us a direct WhatsApp message for instant reply.
              </p>
            </div>
            <a
              href="https://wa.me/923359939702?text=Hello%20Prism%20Real%20Estate,%20I%20want%20to%20inquire."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}