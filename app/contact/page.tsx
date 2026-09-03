"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Loader2 } from "lucide-react";
import { createPropertyInquiry } from "@/lib/db";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await createPropertyInquiry({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        message: message.trim() || undefined,
        property_title: "General Customer Support / Contact Us Inquiry",
        status: "New",
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || "Failed to submit message. Please try again.");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again or WhatsApp us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="font-serif font-bold text-3xl text-karobaari-darkGray">
            Customer Care &amp; Support
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            We are here to assist with product inquiries, delivery tracking, real estate appointments, and course access.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div className="space-y-6">
            <div>
              <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Direct Hotline &amp; WhatsApp</span>
              <a href="tel:+923359939702" className="flex items-center gap-3 font-bold text-base text-karobaari-darkGray hover:text-karobaari-maroon">
                <Phone className="w-5 h-5 text-karobaari-maroon" />
                <span>+92 335 9939 702</span>
              </a>
            </div>

            <div>
              <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Official Email</span>
              <a href="mailto:prismrealestate4@gmail.com" className="flex items-center gap-3 font-medium text-gray-700 hover:text-karobaari-maroon">
                <Mail className="w-5 h-5 text-karobaari-maroon" />
                <span>prismrealestate4@gmail.com</span>
              </a>
            </div>

            <div>
              <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Physical Office Address</span>
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-karobaari-maroon flex-shrink-0 mt-0.5" />
                <span>Main Stop Shahpur, Adyala Road, Rawalpindi / Islamabad, Pakistan</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <a
                href="https://wa.me/923359939702?text=Hello%20Karobaari%20Hub%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Live WhatsApp Assistance</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-base text-karobaari-darkGray mb-4">Send Us a Direct Message</h3>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-800">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-bold">Message sent successfully!</p>
                <p className="text-xs mt-1">Our customer support team has received your message and will contact you shortly on WhatsApp.</p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setName(""); setPhone(""); setMessage(""); }}
                  className="mt-4 text-xs font-bold text-karobaari-maroon hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {errorMessage && (
                  <p className="text-red-600 text-xs bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium">
                    {errorMessage}
                  </p>
                )}
                <div>
                  <label className="font-semibold block mb-1 text-gray-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-karobaari-darkGray font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-gray-700">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0335 9939702"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-karobaari-darkGray font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-gray-700">Message / Inquiry *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you today? Inquire about products, properties, books, or courses..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-karobaari-darkGray"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-karobaari-maroon hover:bg-karobaari-darkMaroon text-white font-bold py-3 rounded-lg shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{loading ? "Sending Message..." : "Submit Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}