"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  brand: string;
  name: string;
  size: string;
  unitPrice: number; // display only. The server must re-check prices at checkout.
  quantity: number;
};

const STORAGE_KEY = "crowns-and-auras-cart";
export const MAX_QUANTITY = 10;

const EMPTY_CART: CartItem[] = [];
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY_CART;
const listeners = new Set<() => void>();

function readCart(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_CART;
  }

  // Same text as last time means the same list object, which React requires
  if (raw === cachedRaw) return cachedItems;

  let parsed: CartItem[] = EMPTY_CART;
  if (raw) {
    try {
      const value: unknown = JSON.parse(raw);
      if (Array.isArray(value)) parsed = value as CartItem[];
    } catch {
      // corrupt data: treat as an empty cart
    }
  }
  cachedRaw = raw;
  cachedItems = parsed;
  return cachedItems;
}

function writeCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (e.g. private mode): the cart won't persist
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener); // changes from other tabs
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// Server renders an empty cart, then the phone swaps in the real one: no mismatch.
export function useCartItems(): CartItem[] {
  return useSyncExternalStore(subscribe, readCart, () => EMPTY_CART);
}

export function addToCart(newItem: Omit<CartItem, "quantity">) {
  const items = readCart();
  const existingItem = items.find(
    (item) => item.productId === newItem.productId && item.size === newItem.size,
  );

  if (existingItem) {
    writeCart(
      items.map((item) =>
        item === existingItem
          ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
          : item,
      ),
    );
  } else {
    writeCart([...items, { ...newItem, quantity: 1 }]);
  }
}

export function updateQuantity(productId: string, size: string, quantity: number) {
  const safeQuantity = Math.min(Math.max(quantity, 1), MAX_QUANTITY);
  writeCart(
    readCart().map((item) =>
      item.productId === productId && item.size === size
        ? { ...item, quantity: safeQuantity }
        : item,
    ),
  );
}

export function removeItem(productId: string, size: string) {
  writeCart(
    readCart().filter(
      (item) => !(item.productId === productId && item.size === size),
    ),
  );
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}