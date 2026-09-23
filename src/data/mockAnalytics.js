// Mock analytics data — stands in for GET /api/admin/analytics?range=30 in the MERN spec.
// Everything on the Admin Dashboard is *computed* from this order list, so when the
// backend is ready you only need to replace `orders` (and `sessionsByDay`) with API data.
import { products, categories } from "./products";

export const ANALYTICS_CONFIGURED = true; // set false -> dashboard shows "connect analytics" instead of conversion metrics
export const LOW_STOCK_THRESHOLD = 3;
export const HISTORY_DAYS = 180;

// ---------- deterministic random (same data on every reload) ----------
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);
const pickWeighted = (items, weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
};

const iso = (d) => d.toISOString().slice(0, 10);
const startOfToday = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d; };

const PAYMENTS = ["UPI", "Card", "COD", "Net Banking", "Wallet"];
const PAY_WEIGHTS = [46, 24, 18, 7, 5];
const productWeights = products.map((p) => p.rating * Math.log(p.reviewCount + 2));

// ---------- generate orders + daily sessions ----------
function generate() {
  const list = [];
  const today = startOfToday();
  let seq = 480000;
  for (let ago = HISTORY_DAYS - 1; ago >= 0; ago--) {
    const day = new Date(today); day.setUTCDate(day.getUTCDate() - ago);
    const dow = day.getUTCDay();
    const weekend = dow === 0 || dow === 6 ? 1.25 : 1;
    const growth = 1 + (HISTORY_DAYS - ago) / HISTORY_DAYS * 0.35; // business is growing
    const count = Math.max(2, Math.round((8 + rand() * 6) * weekend * growth));

    for (let n = 0; n < count; n++) {
      const lines = 1 + (rand() < 0.28 ? 1 : 0);
      const items = [];
      for (let l = 0; l < lines; l++) {
        const p = pickWeighted(products, productWeights);
        const color = p.colors[Math.floor(rand() * p.colors.length)];
        items.push({
          productId: p.id, name: p.name, brand: p.brand, category: p.category,
          color: color.name, size: color.sizes[Math.floor(rand() * color.sizes.length)],
          qty: rand() < 0.12 ? 2 : 1, price: p.price,
        });
      }
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const customerType = rand() < 0.42 ? "new" : "returning";
      let coupon = null;
      const r = rand();
      if (customerType === "new" && r < 0.5) coupon = "WELCOME10";
      else if (customerType === "returning" && r < 0.08) coupon = "WELCOME10";
      else if (subtotal < 5000 && r > 0.82) coupon = "FREESHIP";

      const baseShipping = subtotal >= 5000 ? 0 : 99;
      const shipping = coupon === "FREESHIP" ? 0 : baseShipping;
      const discount = coupon === "WELCOME10" ? Math.round(subtotal * 0.1) : coupon === "FREESHIP" ? baseShipping : 0;

      let status;
      const rr = rand();
      if (rr < 0.05) status = "Cancelled";
      else if (ago >= 7 && rr < 0.12) status = "Returned";
      else if (ago >= 6) status = "Delivered";
      else if (ago >= 2) status = "Shipped";
      else status = "Processing";

      list.push({
        id: `SS${seq++}`, date: iso(day), items, subtotal, discount, shipping, coupon, status,
        total: subtotal - (coupon === "WELCOME10" ? discount : 0) + shipping,
        payment: pickWeighted(PAYMENTS, PAY_WEIGHTS), customerType,
      });
    }
  }
  return list;
}

export const orders = generate();

// ---------- helpers ----------
const inRange = (from, to) => (o) => o.date >= from && o.date <= to;
const isLive = (o) => o.status !== "Cancelled";

function summarize(list) {
  const live = list.filter(isLive);
  const returned = live.filter((o) => o.status === "Returned");
  const gross = live.reduce((s, o) => s + o.subtotal, 0);
  const discounts = live.reduce((s, o) => s + o.discount, 0);
  const refunds = returned.reduce((s, o) => s + (o.subtotal - o.discount), 0);
  const net = gross - discounts - refunds;
  const units = live.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
  const cnt = live.length;
  return {
    gross, discounts, refunds, net, units, orders: cnt,
    aov: cnt ? Math.round(net / cnt) : 0,
    returned: returned.length,
    returnRate: cnt ? (returned.length / cnt) * 100 : 0,
    newCustomers: live.filter((o) => o.customerType === "new").length,
    returningCustomers: live.filter((o) => o.customerType === "returning").length,
  };
}

const pct = (cur, prev) => (prev ? ((cur - prev) / prev) * 100 : null);

function rank(list, keyFn, nameFn) {
  const map = new Map();
  list.filter(isLive).forEach((o) =>
    o.items.forEach((i) => {
      const k = keyFn(i);
      const row = map.get(k) || { key: k, name: nameFn(i), units: 0, revenue: 0 };
      row.units += i.qty; row.revenue += i.price * i.qty;
      map.set(k, row);
    })
  );
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

export function inventoryAlerts() {
  const out = [], low = [];
  let totalSkus = 0;
  products.forEach((p) =>
    p.colors.forEach((c) =>
      c.sizes.forEach((size) => {
        totalSkus++;
        const stock = c.stock[size];
        const row = { sku: `${p.id}-${c.name.replace(/\s/g, "")}-${size}`, name: p.name, brand: p.brand, color: c.name, size, stock };
        if (stock === 0) out.push(row);
        else if (stock <= LOW_STOCK_THRESHOLD) low.push(row);
      })
    )
  );
  low.sort((a, b) => a.stock - b.stock);
  return { out, low, totalSkus };
}

// ---------- main entry used by the dashboard ----------
export function buildDashboard(rangeDays) {
  const today = startOfToday();
  const shift = (n) => { const d = new Date(today); d.setUTCDate(d.getUTCDate() - n); return iso(d); };
  const from = shift(rangeDays - 1), to = shift(0);
  const prevFrom = shift(rangeDays * 2 - 1), prevTo = shift(rangeDays);

  const cur = orders.filter(inRange(from, to));
  const prev = orders.filter(inRange(prevFrom, prevTo));
  const s = summarize(cur), p = summarize(prev);

  // daily series (fills empty days with 0)
  const series = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const date = shift(i);
    const day = summarize(cur.filter((o) => o.date === date));
    series.push({ date, net: day.net, gross: day.gross, orders: day.orders, units: day.units });
  }

  // payment split
  const payment = PAYMENTS.map((m) => {
    const list = cur.filter((o) => isLive(o) && o.payment === m);
    return { method: m, orders: list.length, revenue: list.reduce((a, o) => a + o.total, 0) };
  });

  // coupons
  const coupons = ["WELCOME10", "FREESHIP"].map((code) => {
    const list = cur.filter((o) => isLive(o) && o.coupon === code);
    return {
      code, uses: list.length,
      discountGiven: list.reduce((a, o) => a + o.discount, 0),
      revenue: list.reduce((a, o) => a + o.total, 0),
      share: s.orders ? (list.length / s.orders) * 100 : 0,
    };
  });

  // conversion funnel (needs analytics)
  const sessions = series.reduce((a, d) => a + (sessionsByDay[d.date] || 0), 0);
  const prevSessions = (() => { let t = 0; for (let i = rangeDays * 2 - 1; i >= rangeDays; i--) t += sessionsByDay[shift(i)] || 0; return t; })();
  const placed = cur.length;
  const funnel = [
    { label: "Sessions", value: sessions },
    { label: "Product views", value: Math.round(sessions * 0.62) },
    { label: "Added to cart", value: Math.round(sessions * 0.11) },
    { label: "Reached checkout", value: Math.round(sessions * 0.055) },
    { label: "Orders placed", value: placed },
  ];
  const conversion = sessions ? (placed / sessions) * 100 : 0;
  const prevConversion = prevSessions ? (prev.length / prevSessions) * 100 : 0;

  const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  return {
    range: { from, to },
    summary: s,
    deltas: {
      gross: pct(s.gross, p.gross), net: pct(s.net, p.net), orders: pct(s.orders, p.orders),
      aov: pct(s.aov, p.aov), units: pct(s.units, p.units),
      returnRate: s.returnRate - p.returnRate, conversion: conversion - prevConversion,
    },
    series, payment, coupons, funnel, conversion,
    topProducts: rank(cur, (i) => i.productId, (i) => `${i.brand} ${i.name}`).slice(0, 5),
    topCategories: rank(cur, (i) => i.category, (i) => catName[i.category] || i.category).slice(0, 6),
    topBrands: rank(cur, (i) => i.brand, (i) => i.brand).slice(0, 6),
    recent: [...orders].reverse().slice(0, 6),
  };
}

// sessions map lives here so buildDashboard can read it
const sessionsByDay = {};
{
  // regenerate sessions deterministically from order counts (analytics tool would give real numbers)
  const perDay = {};
  orders.forEach((o) => { perDay[o.date] = (perDay[o.date] || 0) + 1; });
  const r2 = mulberry32(77);
  Object.entries(perDay).forEach(([d, c]) => { sessionsByDay[d] = Math.round(c / (0.026 + r2() * 0.012)); });
}
