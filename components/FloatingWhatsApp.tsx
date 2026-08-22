"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/db";
import { initialSiteSettings } from "@/lib/mockData";

export default function FloatingWhatsApp() {
  const [whatsapp, setWhatsapp] = useState(initialSiteSettings.whatsapp);

  const loadSettings = () => {
    getSiteSettings().then((s) => {
      if (s?.whatsapp) {
        setWhatsapp(s.whatsapp);
      }
    });
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener("kb_settings_updated", loadSettings);
    return () => window.removeEventListener("kb_settings_updated", loadSettings);
  }, []);

  const cleanNumber = whatsapp.replace(/[^0-9]/g, "");

  return (
    <a
      href={`https://wa.me/${cleanNumber || "923359939702"}?text=Hello%20Karobaari%20Hub,%20I%20have%20an%20inquiry%20regarding%20products/properties.`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 md:bottom-6 right-5 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-transform transform hover:scale-110 active:scale-95 group border-2 border-white"
    >
      <MessageCircle className="w-6 h-6 fill-white text-emerald-600" />
      <span className="hidden group-hover:inline-block ml-2 text-xs font-bold pr-1">
        WhatsApp Us
      </span>
    </a>
  );
}