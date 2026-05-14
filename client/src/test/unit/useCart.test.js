import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCart } from "../../hooks/useCart";

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

const mockProduct = {
  uuid: "prod-uuid-001",
  name: "iPhone 15 Pro",
  price: 134900,
  stock_quantity: 20,
};

const mockProduct2 = {
  uuid: "prod-uuid-002",
  name: "Samsung Galaxy S24",
  price: 79999,
  stock_quantity: 10,
};

describe("useCart Hook — Unit Tests", () => {
  // ── Initial state ───────────────────────────────────────────────────────────
  describe("Initial State", () => {
    it("starts with empty cart", () => {
      const { result } = renderHook(() => useCart());
      expect(result.current.cart).toHaveLength(0);
    });

    it("starts with total = 0", () => {
      const { result } = renderHook(() => useCart());
      expect(result.current.total).toBe(0);
    });

    it("loads cart from localStorage on init", () => {
      const saved = [{ ...mockProduct, qty: 2 }];
      localStorage.setItem("cart", JSON.stringify(saved));
      const { result } = renderHook(() => useCart());
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].name).toBe("iPhone 15 Pro");
    });
  });

  // ── addToCart ───────────────────────────────────────────────────────────────
  describe("addToCart()", () => {
    it("adds a new product to cart", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].name).toBe("iPhone 15 Pro");
    });

    it("adds product with correct quantity", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 3));
      expect(result.current.cart[0].qty).toBe(3);
    });

    it("increases quantity for existing product", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      act(() => result.current.addToCart(mockProduct, 2));
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].qty).toBe(3);
    });

    it("adds multiple different products", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      act(() => result.current.addToCart(mockProduct2, 1));
      expect(result.current.cart).toHaveLength(2);
    });

    it("saves cart to localStorage on add", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      const saved = JSON.parse(localStorage.getItem("cart"));
      expect(saved).toHaveLength(1);
      expect(saved[0].uuid).toBe("prod-uuid-001");
    });
  });

  // ── removeFromCart ──────────────────────────────────────────────────────────
  describe("removeFromCart()", () => {
    it("removes a product from cart", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      act(() => result.current.removeFromCart("prod-uuid-001"));
      expect(result.current.cart).toHaveLength(0);
    });

    it("removes only the specified product", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      act(() => result.current.addToCart(mockProduct2, 1));
      act(() => result.current.removeFromCart("prod-uuid-001"));
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].uuid).toBe("prod-uuid-002");
    });

    it("does nothing for non-existent uuid", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      act(() => result.current.removeFromCart("non-existent-uuid"));
      expect(result.current.cart).toHaveLength(1);
    });
  });

  // ── updateQty ───────────────────────────────────────────────────────────────
  describe("updateQty()", () => {
    it("updates quantity of a product", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      act(() => result.current.updateQty("prod-uuid-001", 5));
      expect(result.current.cart[0].qty).toBe(5);
    });

    it("does not update if qty is less than 1", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 2));
      act(() => result.current.updateQty("prod-uuid-001", 0));
      expect(result.current.cart[0].qty).toBe(2);
    });

    it("does not update negative qty", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 2));
      act(() => result.current.updateQty("prod-uuid-001", -1));
      expect(result.current.cart[0].qty).toBe(2);
    });
  });

  // ── clearCart ───────────────────────────────────────────────────────────────
  describe("clearCart()", () => {
    it("clears all items from cart", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      act(() => result.current.addToCart(mockProduct2, 2));
      act(() => result.current.clearCart());
      expect(result.current.cart).toHaveLength(0);
    });

    it("removes cart from localStorage", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      act(() => result.current.clearCart());
      // After clear, cart is either null or empty array
      const stored = localStorage.getItem("cart");
      const isEmpty = stored === null || JSON.parse(stored).length === 0;
      expect(isEmpty).toBe(true);
    });
  });

  // ── total ───────────────────────────────────────────────────────────────────
  describe("total calculation", () => {
    it("calculates total correctly for single item", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 2));
      expect(result.current.total).toBe(134900 * 2);
    });

    it("calculates total for multiple items", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 1));
      act(() => result.current.addToCart(mockProduct2, 2));
      const expected = 134900 * 1 + 79999 * 2;
      expect(result.current.total).toBe(expected);
    });

    it("total is 0 after clearing cart", () => {
      const { result } = renderHook(() => useCart());
      act(() => result.current.addToCart(mockProduct, 3));
      act(() => result.current.clearCart());
      expect(result.current.total).toBe(0);
    });
  });
});
