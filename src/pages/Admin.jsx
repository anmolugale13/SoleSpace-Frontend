import { useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { products as initialProducts } from "../data/products";
import { mockOrders } from "../data/mockOrders";
import { useToast } from "../context/ToastContext";
import Dashboard from "./admin/Dashboard";

const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;

function ProductsAdmin() {
  const [rows, setRows] = useState(initialProducts.map((p) => ({ ...p, published: true })));
  const [query, setQuery] = useState("");
  const { push } = useToast();

  const filtered = rows.filter((p) => (p.name + p.brand).toLowerCase().includes(query.toLowerCase()));
  const togglePublish = (id) => {
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, published: !p.published } : p)));
    push("Product status updated");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between mb-5">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="input max-w-xs" />
        <button onClick={() => push("New product draft created")} className="btn-primary">+ Add product</button>
      </div>
      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-haze"><tr className="text-left label-eyebrow"><th className="p-3">Product</th><th className="p-3">Brand</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody className="divide-y divide-ink/10">
            {filtered.map((p) => {
              const totalStock = p.colors.reduce((s, c) => s + c.sizes.reduce((s2, sz) => s2 + c.stock[sz], 0), 0);
              return (
                <tr key={p.id}>
                  <td className="p-3 flex items-center gap-3"><img src={p.images[0]} alt="" className="h-10 w-10 object-cover bg-haze" />{p.name}</td>
                  <td className="p-3 text-graphite">{p.brand}</td>
                  <td className="p-3 font-mono">{fmt(p.price)}</td>
                  <td className="p-3 font-mono">{totalStock <= 5 ? <span className="text-cone">{totalStock}</span> : totalStock}</td>
                  <td className="p-3"><span className={`stamp ${p.published ? "" : "opacity-50"}`}>{p.published ? "Published" : "Draft"}</span></td>
                  <td className="p-3 text-right"><button onClick={() => togglePublish(p.id)} className="stitch text-xs">{p.published ? "Unpublish" : "Publish"}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersAdmin() {
  const { push } = useToast();
  const [statusMap, setStatusMap] = useState(Object.fromEntries(mockOrders.map((o) => [o.id, o.status])));
  const cycle = { Processing: "Shipped", Shipped: "Delivered", Delivered: "Delivered", "Return Requested": "Returned", Returned: "Returned" };
  return (
    <div className="overflow-x-auto border border-ink/15">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-haze"><tr className="text-left label-eyebrow"><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
        <tbody className="divide-y divide-ink/10">
          {mockOrders.map((o) => (
            <tr key={o.id}>
              <td className="p-3 font-mono">{o.id}</td>
              <td className="p-3 text-graphite">{o.date}</td>
              <td className="p-3">{o.items.length}</td>
              <td className="p-3 font-mono">{fmt(o.total)}</td>
              <td className="p-3"><span className="stamp">{statusMap[o.id]}</span></td>
              <td className="p-3 text-right">
                <button
                  onClick={() => { setStatusMap((s) => ({ ...s, [o.id]: cycle[s[o.id]] })); push(`Order ${o.id} updated`); }}
                  className="stitch text-xs"
                >
                  Advance status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CouponsAdmin() {
  const coupons = [
    { code: "WELCOME10", type: "10% off", uses: "312 / 1000", ends: "2026-09-30" },
    { code: "FREESHIP", type: "Free shipping", uses: "89 / ∞", ends: "2026-10-15" },
  ];
  return (
    <div className="overflow-x-auto border border-ink/15">
      <table className="w-full text-sm min-w-[560px]">
        <thead className="bg-haze"><tr className="text-left label-eyebrow"><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Usage</th><th className="p-3">Ends</th></tr></thead>
        <tbody className="divide-y divide-ink/10">
          {coupons.map((c) => (
            <tr key={c.code}><td className="p-3 font-mono">{c.code}</td><td className="p-3">{c.type}</td><td className="p-3 font-mono">{c.uses}</td><td className="p-3 text-graphite">{c.ends}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tabs = [
  { to: "", label: "Dashboard", el: <Dashboard /> },
  { to: "products", label: "Products", el: <ProductsAdmin /> },
  { to: "orders", label: "Orders", el: <OrdersAdmin /> },
  { to: "coupons", label: "Coupons", el: <CouponsAdmin /> },
];

export default function Admin() {
  return (
    <div className="bg-haze min-h-screen">
      <div className="container-x py-10">
        <p className="label-eyebrow mb-1">Super Admin</p>
        <h1 className="font-display text-4xl mb-8">Admin Console</h1>
        <div className="flex gap-2 mb-8 overflow-x-auto border-b border-ink/10">
          {tabs.map((t) => (
            <NavLink key={t.label} to={`/admin/${t.to}`} end={t.to === ""} className={({ isActive }) => `font-mono text-xs uppercase tracking-wider px-4 py-3 whitespace-nowrap border-b-2 ${isActive ? "border-ink text-ink" : "border-transparent text-graphite"}`}>
              {t.label}
            </NavLink>
          ))}
        </div>
        <Routes>
          {tabs.map((t) => <Route key={t.label} path={t.to === "" ? "" : t.to} element={t.el} />)}
        </Routes>
      </div>
    </div>
  );
}
