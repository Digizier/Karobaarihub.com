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