import { useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { mockOrders } from "../data/mockOrders";

/* ---------- Icons (inline, no extra dependency) ---------- */

function IconGrid(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" />
    </svg>
  );
}

function IconPackage(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" {...props}>
      <path d="M2.8 6.2 10 2.5l7.2 3.7L10 9.9 2.8 6.2Z" />
      <path d="M2.8 6.2v7.6L10 17.5l7.2-3.7V6.2" />
      <path d="M10 9.9v7.6" />
    </svg>
  );
}

function IconPin(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M10 17.3s5.8-4.9 5.8-9.2a5.8 5.8 0 1 0-11.6 0c0 4.3 5.8 9.2 5.8 9.2Z" />
      <circle cx="10" cy="8.1" r="2.1" />
    </svg>
  );
}

function IconSliders(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <line x1="3" y1="6" x2="17" y2="6" />
      <line x1="3" y1="10" x2="17" y2="10" />
      <line x1="3" y1="14" x2="17" y2="14" />
      <circle cx="7" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="13" cy="10" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="9" cy="14" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- Shared order-status pieces ---------- */

const statusStyles = {
  Delivered: { badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20", dot: "bg-emerald-500" },
  Shipped: { badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/20", dot: "bg-sky-500" },
  "Return Requested": { badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20", dot: "bg-rose-500" },
  Processing: { badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20", dot: "bg-amber-500" },
};

function StatusBadge({ status }) {
  const s = statusStyles[status] ?? statusStyles.Processing;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

const journeySteps = ["Processing", "Shipped", "Delivered"];

function OrderProgress({ status }) {
  if (status === "Return Requested") {
    return (
      <div className="flex items-center gap-2 text-xs text-rose-600 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Return in progress — we'll email you the next steps
      </div>
    );
  }

  const currentIndex = journeySteps.indexOf(status);

  return (
    <div className="flex items-center">
      {journeySteps.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${i <= currentIndex ? "bg-ink" : "bg-gray-200"}`} />
            <span
              className={`text-[10px] font-mono uppercase tracking-wide ${
                i <= currentIndex ? "text-ink" : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
          {i < journeySteps.length - 1 && (
            <div className={`h-px flex-1 mx-2 mb-4 ${i < currentIndex ? "bg-ink" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InlineProgress({ status }) {
  const idx = journeySteps.indexOf(status);
  const pct = idx === -1 ? 0 : ((idx + 1) / journeySteps.length) * 100;
  return (
    <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------- Overview ---------- */

function Overview() {
  const { user } = useAuth();
  const latest = mockOrders[0];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col justify-between min-h-[140px]">
          <p className="label-eyebrow text-white/50 mb-6">Orders placed</p>
          <p className="font-display text-5xl text-cone">{mockOrders.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col justify-between min-h-[140px]">
          <p className="label-eyebrow text-gray-500 mb-6">Loyalty points</p>
          <p className="font-display text-2xl text-cone">{user.loyaltyPoints}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col justify-between min-h-[140px]">
          <p className="label-eyebrow text-gray-500 mb-6">Wishlist</p>
          <p className="font-display text-2xl text-cone">Synced</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-lg text-ink">Most recent order</p>
          <span className="font-mono text-xs text-gray-400">{latest.date}</span>
        </div>

        <div className="flex items-start gap-5 mb-6">
          <img
            src={latest.items[0].image}
            alt=""
            className="h-20 w-20 rounded-xl object-cover border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink">{latest.id}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {latest.items.length} item{latest.items.length > 1 ? "s" : ""}
            </p>
            <div className="mt-2">
              <StatusBadge status={latest.status} />
            </div>
          </div>
        </div>

        <OrderProgress status={latest.status} />
      </div>
    </div>
  );
}

/* ---------- Orders ---------- */

function Orders() {
  return (
    <div className="space-y-5">
      {mockOrders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
            <div>
              <p className="font-semibold text-ink">{o.id}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{o.date}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>

          <div className="flex flex-wrap gap-4 mb-5">
            {o.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={it.image}
                  alt=""
                  className="h-14 w-14 rounded-lg object-cover border border-gray-200"
                />
                <div className="text-xs">
                  <p className="font-medium text-ink">{it.name}</p>
                  <p className="text-gray-500 mt-0.5">
                    {it.color} · US {it.size} × {it.qty}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {(o.status === "Processing" || o.status === "Shipped") && (
            <div className="mb-5">
              <InlineProgress status={o.status} />
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <span className="font-mono text-sm text-ink">₹{o.total.toLocaleString("en-IN")}</span>
            <div className="flex gap-2 text-xs">
              <button className="stitch hover:bg-haze">Invoice</button>
              <button className="stitch hover:bg-haze">Reorder</button>
              {o.status === "Delivered" && (
                <button className="stitch hover:bg-haze">Return / Exchange</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Addresses ---------- */

function Addresses() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: "Home",
      name: "Alex Rivera",
      line1: "24 Harbor View Lane",
      city: "Pune",
      state: "MH",
      pin: "411001",
      isDefault: true,
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    name: "",
    line1: "",
    city: "",
    state: "",
    pin: "",
  });

  const add = (e) => {
    e.preventDefault();
    setAddresses((prev) => [
      ...prev,
      { ...form, id: Date.now(), isDefault: prev.length === 0 },
    ]);
    setForm({ label: "Home", name: "", line1: "", city: "", state: "", pin: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="space-y-4 mb-6">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 flex justify-between items-start gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="stamp">{a.label}</span>
                {a.isDefault && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Default
                  </span>
                )}
              </div>
              <p className="font-medium text-ink">{a.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {a.line1}, {a.city}, {a.state} {a.pin}
              </p>
            </div>
            <button
              onClick={() =>
                setAddresses((prev) => prev.filter((x) => x.id !== a.id))
              }
              className="text-gray-400 hover:text-rose-500 text-sm font-medium transition"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="btn-outline px-5 py-2.5 rounded-xl"
        >
          + Add address
        </button>
      ) : (
        <form
          onSubmit={add}
          className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4"
        >
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input rounded-xl border-gray-300 focus:ring-2 focus:ring-track"
          />
          <input
            required
            placeholder="Address line"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            className="input rounded-xl border-gray-300 focus:ring-2 focus:ring-track"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="input rounded-xl border-gray-300 focus:ring-2 focus:ring-track"
            />
            <input
              required
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="input rounded-xl border-gray-300 focus:ring-2 focus:ring-track"
            />
            <input
              required
              placeholder="PIN"
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
              className="input rounded-xl border-gray-300 focus:ring-2 focus:ring-track"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-outline flex-1 rounded-xl"
            >
              Cancel
            </button>
            <button className="btn-primary flex-1 rounded-xl">Save address</button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ---------- Settings ---------- */

function Settings() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className="label-eyebrow block mb-1.5 text-gray-500">Name</label>
          <input
            defaultValue={user.name}
            className="input rounded-xl border-gray-300 focus:ring-2 focus:ring-track"
          />
        </div>
        <div>
          <label className="label-eyebrow block mb-1.5 text-gray-500">Email</label>
          <input
            defaultValue={user.email}
            className="input rounded-xl border-gray-300 bg-gray-50 text-gray-500"
            disabled
          />
        </div>
        <button
          onClick={() => push("Profile updated")}
          className="btn-primary w-full rounded-xl"
        >
          Save changes
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="font-display text-lg text-ink mb-4 pb-3 border-b border-gray-100">
          Notification preferences
        </p>
        <div className="space-y-1">
          {["Order updates", "Back-in-stock alerts", "Price drop alerts", "Marketing emails"].map((n) => (
            <label
              key={n}
              className="flex items-center justify-between gap-3 text-sm py-2.5 cursor-pointer text-ink"
            >
              {n}
              <input
                type="checkbox"
                defaultChecked={n !== "Marketing emails"}
                className="accent-track h-4 w-4"
              />
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          logout();
          push("Logged out");
          navigate("/");
        }}
        className="btn-outline w-full rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
      >
        Log out
      </button>
    </div>
  );
}

/* ---------- Layout ---------- */

const tabs = [
  { to: "", label: "Overview", icon: IconGrid, el: <Overview /> },
  { to: "orders", label: "Orders", icon: IconPackage, el: <Orders /> },
  { to: "addresses", label: "Addresses", icon: IconPin, el: <Addresses /> },
  { to: "settings", label: "Settings", icon: IconSliders, el: <Settings /> },
];

export default function Account() {
  const { user } = useAuth();
  const initials = (user.name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <div className="container-x py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="h-12 w-12 shrink-0 rounded-full bg-ink text-white flex items-center justify-center font-display text-lg">
          {initials}
        </div>
        <div>
          <p className="label-eyebrow text-gray-500 mb-0.5">Hi, {user.name}</p>
          <h1 className="font-display text-3xl text-ink">My Account</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Navigation */}
        <nav className="md:w-52 shrink-0 flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-gray-100 md:pr-6">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <NavLink
                key={t.label}
                to={`/account/${t.to}`}
                end={t.to === ""}
                className={({ isActive }) =>
                  `flex items-center gap-3 font-mono text-xs uppercase tracking-wider px-3 py-2.5 rounded-lg whitespace-nowrap transition ${
                    isActive ? "bg-ink text-white" : "text-gray-500 hover:bg-haze hover:text-ink"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <Routes>
            {tabs.map((t) => (
              <Route key={t.label} path={t.to === "" ? "" : t.to} element={t.el} />
            ))}
          </Routes>
        </div>
      </div>
    </div>
  );
}
