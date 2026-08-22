"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "karobaari" | "prism" | "combined";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ variant = "karobaari", className = "", size = "md" }: LogoProps) {
  if (variant === "prism") {
    return (
      <Link href="/real-estate" className={`flex items-center gap-2 group min-w-0 ${className}`}>
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-karobaari-gold bg-karobaari-darkGray flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
          <Image
            src="/assets/prism-logo.jpeg"
            alt="Prism Real Estate"
            width={40}
            height={40}
            unoptimized
            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-serif font-bold text-base sm:text-xl text-white tracking-wider leading-none truncate">
            PRISM
          </span>
          <span className="text-[9px] sm:text-[10px] text-karobaari-gold font-medium tracking-widest uppercase truncate">
            Real Estate
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/" className={`flex items-center gap-2 group min-w-0 ${className}`}>
      <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full border-2 border-karobaari-gold bg-karobaari-darkMaroon flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
        <Image
          src="/assets/karobaari-hub-logo.jpeg"
          alt="Karobaari Hub"
          width={44}
          height={44}
          unoptimized
          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-serif font-extrabold text-base sm:text-2xl text-white tracking-wide leading-none group-hover:text-karobaari-gold transition-colors flex items-center">
          KAROBAARI<span className="text-karobaari-gold font-sans font-bold text-xs sm:text-sm ml-1 px-1 sm:px-1.5 py-0.2 rounded bg-karobaari-darkMaroon border border-karobaari-gold/30">HUB</span>
        </span>
        <span className="text-[8px] sm:text-[10px] text-gray-300 font-sans tracking-wider uppercase font-medium mt-0.5 truncate hidden xs:block">
          Your Premium Marketplace
        </span>
      </div>
    </Link>
  );
}