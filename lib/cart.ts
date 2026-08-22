import { CartItem } from "./types";

const CART_STORAGE_KEY = "kb_cart_items_v1";
const APPLIED_VOUCHER_KEY = "kb_applied_voucher_code_v1";

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("kb_cart_updated"));
  } catch (err) {
    console.error("Cart save error:", err);
  }
}

export function openCartDrawer(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("kb_open_cart_drawer"));
}

export function closeCartDrawer(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("kb_close_cart_drawer"));
}

export function getAppliedVoucherCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(APPLIED_VOUCHER_KEY);
  } catch {
    return null;
  }
}

export function saveAppliedVoucherCode(code: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (code && code.trim()) {
      localStorage.setItem(APPLIED_VOUCHER_KEY, code.trim().toUpperCase());
    } else {
      localStorage.removeItem(APPLIED_VOUCHER_KEY);
    }
    window.dispatchEvent(new Event("kb_voucher_updated"));
  } catch (err) {
    console.error("Voucher save error:", err);
  }
}

export function addToCart(
  item: Omit<CartItem, "quantity">,
  quantity: number = 1,
  shouldOpenDrawer: boolean = true
): void {
  const items = getCartItems();
  const existingIndex = items.findIndex((i) => i.id === item.id);
  if (existingIndex > -1) {
    items[existingIndex].quantity = Math.min(
      items[existingIndex].quantity + quantity,
      items[existingIndex].stock_available || 99
    );
  } else {
    items.push({ ...item, quantity });
  }
  saveCartItems(items);
  if (shouldOpenDrawer) {
    openCartDrawer();
  }
}

export function updateCartQuantity(id: string, quantity: number): void {
  let items = getCartItems();
  if (quantity <= 0) {
    items = items.filter((i) => i.id !== id);
  } else {
    const target = items.find((i) => i.id === id);
    if (target) {
      target.quantity = Math.min(quantity, target.stock_available || 99);
    }
  }
  saveCartItems(items);
}

export function removeFromCart(id: string): void {
  const items = getCartItems().filter((i) => i.id !== id);
  saveCartItems(items);
}

export function clearCart(): void {
  saveCartItems([]);
  saveAppliedVoucherCode(null);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}