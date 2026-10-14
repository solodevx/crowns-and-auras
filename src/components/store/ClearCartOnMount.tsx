"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart-store";

// Renders nothing. Its only job is to empty the cart once the confirmation page opens.
export default function ClearCartOnMount() {
  useEffect(() => {
    clearCart();
  }, []);

  return null;
}
