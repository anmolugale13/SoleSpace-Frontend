import { useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { mockOrders } from "../data/mockOrders";

const statusTone = {
  Delivered: "bg-track text-white",
  Shipped: "bg-ink text-white",
  "Return Requested": "bg-cone text-white",
  Processing: "bg-haze text-ink",
};

function Overview() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="border border-ink/15 p-5"><p className="label-eyebrow mb-1">Orders</p><p className="font-display text-3xl">{mockOrders.length}</p></div>
        <div className="border border-ink/15 p-5"><p className="label-eyebrow mb-1">Loyalty points</p><p className="font-display text-3xl">{user.loyaltyPoints}</p></div>
        <div className="border border-ink/15 p-5"><p className="label-eyebrow mb-1">Wishlist</p><p className="font-display text-3xl">Synced</p></div>
      </div>
      <div className="border border-ink/15 p-5">
        <p className="font-display text-lg mb-3">Most recent order</p>
        <div className="flex items-center gap-4">
          <img src={mockOrders[0].items[0].image} alt="" className="h-16 w-16 bg-haze object-cover" />
          <div className="flex-1">
            <p className="font-semibold">{mockOrders[0].id}</p>
            <p className="text-sm text-graphite">{mockOrders[0].date}</p>
          </div>
          <span className={`stamp-solid ${statusTone[mockOrders[0].status]}`}>{mockOrders[0].status}</span>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  return (
    <div className="space-y-4">
      {mockOrders.map((o) => (
        <div key={o.id} className="border border-ink/15 p-5">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div>
              <p className="font-semibold">{o.id}</p>
              <p className="text-xs text-graphite font-mono">{o.date}</p>
            </div>
            <span className={`stamp-solid ${statusTone[o.status]}`}>{o.status}</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {o.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={it.image} alt="" className="h-12 w-12 bg-haze object-cover" />
                <div className="text-xs">
                  <p className="font-medium">{it.name}</p>
                  <p className="text-graphite">{it.color} · US {it.size} × {it.qty}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-ink/10">
            <span className="font-mono text-sm">₹{o.total.toLocaleString("en-IN")}</span>
            <div className="flex gap-4 text-xs">
              <button className="stitch">Invoice</button>
              <button className="stitch">Reorder</button>
              {o.status === "Delivered" && <button className="stitch">Return / Exchange</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Addresses() {
  const [addresses, setAddresses] = useState([
    { id: 1, label: "Home", name: "Alex Rivera", line1: "24 Harbor View Lane", city: "Pune", state: "MH", pin: "411001", isDefault: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "Home", name: "", line1: "", city: "", state: "", pin: "" });

  const add = (e) => {
    e.preventDefault();
    setAddresses((prev) => [...prev, { ...form, id: Date.now(), isDefault: prev.length === 0 }]);
    setForm({ label: "Home", name: "", line1: "", city: "", state: "", pin: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="space-y-4 mb-6">
        {addresses.map((a) => (
          <div key={a.id} className="border border-ink/15 p-5 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="stamp">{a.label}</span>
                {a.isDefault && <span className="text-xs text-track font-mono">Default</span>}
              </div>
              <p className="font-medium">{a.name}</p>
              <p className="text-sm text-graphite">{a.line1}, {a.city}, {a.state} {a.pin}</p>
            </div>
            <button onClick={() => setAddresses((prev) => prev.filter((x) => x.id !== a.id))} className="text-graphite hover:text-cone text-sm">Remove</button>
          </div>
        ))}
      </div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-outline">+ Add address</button>
      ) : (
        <form onSubmit={add} className="border border-ink/15 p-5 space-y-3">
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          <input required placeholder="Address line" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="input" />
          <div className="grid grid-cols-3 gap-3">
            <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
            <input required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" />
            <input required placeholder="PIN" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} className="input" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            <button className="btn-primary flex-1">Save address</button>
          </div>
        </form>
      )}
    </div>
  );
}

function Settings() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  return (
    <div className="space-y-6 max-w-md">
      <div className="border border-ink/15 p-5 space-y-3">
        <div><label className="label-eyebrow block mb-1">Name</label><input defaultValue={user.name} className="input" /></div>
        <div><label className="label-eyebrow block mb-1">Email</label><input defaultValue={user.email} className="input" disabled /></div>
        <button onClick={() => push("Profile updated")} className="btn-primary">Save changes</button>
      </div>
      <div className="border border-ink/15 p-5">
        <p className="font-display text-lg mb-3">Notification preferences</p>
        {["Order updates", "Back-in-stock alerts", "Price drop alerts", "Marketing emails"].map((n) => (
          <label key={n} className="flex items-center gap-2 text-sm py-1.5">
            <input type="checkbox" defaultChecked={n !== "Marketing emails"} className="accent-track" /> {n}
          </label>
        ))}
      </div>
      <button
        onClick={() => { logout(); push("Logged out"); navigate("/"); }}
        className="btn-outline w-full"
      >
        Log out
      </button>
    </div>
  );
}

const tabs = [
  { to: "", label: "Overview", el: <Overview /> },
  { to: "orders", label: "Orders", el: <Orders /> },
  { to: "addresses", label: "Addresses", el: <Addresses /> },
  { to: "settings", label: "Settings", el: <Settings /> },
];

export default function Account() {
  const { user } = useAuth();
  return (
    <div className="container-x py-10">
      <p className="label-eyebrow mb-1">Hi, {user.name}</p>
      <h1 className="font-display text-4xl mb-8">My Account</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <nav className="md:w-48 shrink-0 flex md:flex-col gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.label}
              to={`/account/${t.to}`}
              end={t.to === ""}
              className={({ isActive }) => `font-mono text-xs uppercase tracking-wider px-3 py-2.5 whitespace-nowrap ${isActive ? "bg-ink text-white" : "hover:bg-haze"}`}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1 min-w-0">
          <Routes>
            {tabs.map((t) => <Route key={t.label} path={t.to === "" ? "" : t.to} element={t.el} />)}
          </Routes>
        </div>
      </div>
    </div>
  );
}
