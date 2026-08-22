"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CartDrawer from "@/components/CartDrawer";

export default function StoreLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <CartDrawer />
      <MobileBottomNav />
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}