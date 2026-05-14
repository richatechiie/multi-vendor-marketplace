import { useState, useEffect, useCallback } from "react";

const CART_KEY = "cart";

export function useCart() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.uuid === product.uuid);
      if (existing) {
        return prev.map(i =>
          i.uuid === product.uuid ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
  }, []);

  const removeFromCart = useCallback((uuid) => {
    setCart(prev => prev.filter(i => i.uuid !== uuid));
  }, []);

  const updateQty = useCallback((uuid, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.uuid === uuid ? { ...i, qty } : i));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const total = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0);

  return { cart, addToCart, removeFromCart, updateQty, clearCart, total };
}