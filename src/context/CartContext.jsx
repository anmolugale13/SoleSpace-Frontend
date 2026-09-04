import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "solespace_cart_v1";

function lineKey(productId, color, size) {
  return `${productId}__${color}__${size}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, color, size, qty = 1) => {
    setItems((prev) => {
      const key = lineKey(product.id, color, size);
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          image: product.images[0],
          price: product.price,
          mrp: product.mrp,
          color,
          size,
          qty,
        },
      ];
    });
  };

  const updateQty = (key, qty) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clearCart = () => { setItems([]); setCoupon(null); };

  const applyCoupon = (code) => {
    const known = {
      WELCOME10: { code: "WELCOME10", type: "percent", value: 10, label: "10% off" },
      FREESHIP: { code: "FREESHIP", type: "shipping", value: 0, label: "Free shipping" },
    };
    const found = known[code?.toUpperCase()];
    if (found) { setCoupon(found); return { ok: true }; }
    return { ok: false, message: "That code isn't valid. Try WELCOME10 or FREESHIP." };
  };
  const removeCoupon = () => setCoupon(null);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const mrpTotal = useMemo(() => items.reduce((s, i) => s + i.mrp * i.qty, 0), [items]);
  const discount = useMemo(() => {
    let d = mrpTotal - subtotal;
    if (coupon?.type === "percent") d += subtotal * (coupon.value / 100);
    return Math.round(d);
  }, [mrpTotal, subtotal, coupon]);
  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    if (coupon?.type === "shipping") return 0;
    return subtotal >= 4000 ? 0 : 149;
  }, [subtotal, items.length, coupon]);
  const couponSavings = useMemo(() => (coupon?.type === "percent" ? Math.round(subtotal * (coupon.value / 100)) : 0), [subtotal, coupon]);
  const total = useMemo(() => Math.max(0, subtotal - couponSavings) + shipping, [subtotal, couponSavings, shipping]);
  const itemCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  const value = {
    items, addItem, updateQty, removeItem, clearCart,
    coupon, applyCoupon, removeCoupon,
    subtotal, mrpTotal, discount, shipping, total, itemCount, couponSavings,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
