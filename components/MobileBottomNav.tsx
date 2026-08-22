"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Building2, ShoppingCart, Package } from "lucide-react";
import { getCartItems, getCartCount } from "@/lib/cart";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const items = getCartItems();
      setCartCount(getCartCount(items));
    };
    updateCount();
    window.addEventListener("kb_cart_updated", updateCount);
    return () => window.removeEventListener("kb_cart_updated", updateCount);
  }, []);

  // Do not render bottom nav on admin routes
  if (pathname.startsWith("/admin")) return null;

  const navItems = [
    { label: "For You", href: "/", icon: Home, exact: true },
    { label: "Shop", href: "/shop", icon: LayoutGrid },
    { label: "Real Estate", href: "/real-estate", icon: Building2 },
    { label: "Cart", href: "/cart", icon: ShoppingCart, badge: cartCount },
    { label: "Track", href: "/track-order", icon: Package },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl py-1.5 px-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? "text-karobaari-maroon font-semibold" : "text-gray-500 hover:text-karobaari-darkMaroon"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-karobaari-maroon stroke-[2.5]" : "text-gray-500"}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 bg-karobaari-maroon text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {item.badge! > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}