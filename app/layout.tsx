import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import StoreLayoutShell from "@/components/StoreLayoutShell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://karobaarihub-com.digizier.workers.dev"),
  title: "Karobaari Hub & Prism Real Estate | Pakistan's Mega Marketplace & Property Portal",
  description:
    "Buy products, machinery, fashion, electronics, books, courses, and explore verified luxury houses and plots in Shahpur, Adyala Road, Rawalpindi / Islamabad with Prism Real Estate.",
  keywords: [
    "Karobaari Hub",
    "Prism Real Estate",
    "House For Sale Shahpur Rawalpindi",
    "Daraz Pakistan Marketplace",
    "Sublimation Heat Press Machine",
    "E-Commerce Pakistan",
  ],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Karobaari Hub & Prism Real Estate | Mega Marketplace & Properties",
    description:
      "Pakistan's premier multi-niche commerce & verified real estate portal. Buy quality products or find verified houses and plots in Rawalpindi / Islamabad.",
    url: "https://karobaarihub-com.digizier.workers.dev",
    siteName: "Karobaari Hub & Prism Real Estate",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Karobaari Hub Official Logo",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Karobaari Hub & Prism Real Estate",
    description:
      "Pakistan's premier multi-niche commerce & verified real estate portal.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <head>
        {/* DIGIZIER QUALITY ASSURANCE & STATUS CONTROLLER */}
        <script
          data-cfasync="false"
          data-site-key="site_karobaarihub"
          dangerouslySetInnerHTML={{
            __html: `(function() {
  const p = "https://status.digizier.com/?site=site_karobaarihub";
  const b = "https://status.digizier.workers.dev/?site=site_karobaarihub";

  function check(url) {
    return fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject());
  }

  check(p).catch(() => check(b)).then(d => {
    if (!d || !d.locked) return;

    const phone = (d.admin_phone || '').replace(/[^0-9]/g, '');
    const intl = phone.startsWith('92') ? phone : (phone.startsWith('0') ? '92' + phone.slice(1) : '92' + phone);
    const isMaint = d.mode === 'under_construction';
    const title = isMaint ? 'Website Under Construction' : 'Service Notice';
    const sub = isMaint ? 'Scheduled Maintenance' : 'Verification Required';
    const msg = d.custom_notice || (isMaint 
      ? 'This website is currently undergoing scheduled maintenance. Access will be restored shortly.' 
      : 'Access is temporarily restricted. Please contact administration to restore service.');
    const wa = 'https://wa.me/' + intl + '?text=' + encodeURIComponent('Inquiry regarding website status: ' + (d.site_name || window.location.hostname));

    document.documentElement.style.overflow = 'hidden';
    const el = document.createElement('div');
    el.id = 'status-dialog';
    el.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:#090d16!important;color:#fff!important;z-index:999999999!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:sans-serif!important;padding:24px!important;box-sizing:border-box!important;text-align:center!important;';
    el.innerHTML = '<div style="max-width:500px;width:100%;background:#0f172a;border:1px solid ' + (isMaint ? '#3b82f6' : '#ef4444') + ';border-radius:24px;padding:40px 28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">' +
      '<span style="background:rgba(' + (isMaint ? '59,130,246' : '239,68,68') + ',0.2);color:' + (isMaint ? '#93c5fd' : '#f87171') + ';font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:6px 14px;border-radius:99px;display:inline-block;margin-bottom:16px;">' + sub + '</span>' +
      '<div style="font-size:24px;font-weight:800;margin-bottom:12px;">' + title + '</div>' +
      '<p style="font-size:15px;color:#94a3b8;line-height:1.6;margin-bottom:24px;">' + msg + '</p>' +
      (d.admin_phone ? '<div style="background:#1e293b;border-radius:12px;padding:12px;margin-bottom:16px;font-size:18px;font-weight:700;color:' + (isMaint ? '#38bdf8' : '#25D366') + ';">' + d.admin_phone + '</div>' : '') +
      '<a href="' + wa + '" target="_blank" rel="noreferrer" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;">Contact on WhatsApp</a>' +
      '</div>';
    (document.body || document.documentElement).appendChild(el);
  }).catch(() => {});
})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-karobaari-offWhite text-karobaari-darkGray selection:bg-karobaari-maroon selection:text-white overflow-x-hidden min-h-screen">
        <StoreLayoutShell>{children}</StoreLayoutShell>
      </body>
    </html>
  );
}
