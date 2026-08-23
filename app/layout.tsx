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
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Karobaari Hub & Prism Real Estate | Mega Marketplace & Properties",
    description:
      "Pakistan's premier multi-niche commerce & verified real estate portal. Buy quality products or find verified houses and plots in Rawalpindi / Islamabad.",
    url: "https://karobaarihub-com.digizier.workers.dev",
    siteName: "Karobaari Hub & Prism Real Estate",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Karobaari Hub Logo",
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
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased bg-karobaari-offWhite text-karobaari-darkGray selection:bg-karobaari-maroon selection:text-white overflow-x-hidden min-h-screen">
        <StoreLayoutShell>{children}</StoreLayoutShell>
      </body>
    </html>
  );
}