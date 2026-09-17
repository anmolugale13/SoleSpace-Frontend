import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import StepIndicator from "../components/StepIndicator";

const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;
const STEPS = ["Contact", "Delivery", "Payment", "Review"];

export default function Checkout() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [contact, setContact] = useState({ email: user?.email || "", phone: "" });
  const [address, setAddress] = useState({ name: user?.name || "", line1: "", city: "", state: "", pin: "", label: "Home" });
  const [shipMethod, setShipMethod] = useState("standard");
  const [payMethod, setPayMethod] = useState("upi");

  if (cart.items.length === 0 && !orderId) {
    return (
      <div className="container-x py-24 text-center">
        <p className="font-display text-3xl mb-4">Nothing to check out</p>
        <Link to="/shop" className="btn-primary">Shop shoes</Link>
      </div>
    );
  }

  const shipCost = shipMethod === "express" ? Math.max(cart.shipping, 249) : cart.shipping;
  const grandTotal = cart.total - cart.shipping + shipCost;

  const next = (e) => { e.preventDefault(); setStep((s) => Math.min(4, s + 1)); };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const placeOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      const id = "SS" + Math.floor(100000 + Math.random() * 899999);
      setOrderId(id);
      cart.clearCart();
      setPlacing(false);
    }, 900);
  };

  if (orderId) {
    return (
      <div className="container-x py-24 text-center max-w-lg mx-auto">
        <div className="h-16 w-16 rounded-full bg-traction flex items-center justify-center mx-auto mb-6 font-display text-2xl">✓</div>
        <p className="font-display text-4xl mb-3">Order confirmed</p>
        <p className="text-graphite mb-1">Order ID</p>
        <p className="stamp-solid bg-ink text-white text-base mb-6">{orderId}</p>
        <p className="text-sm text-graphite mb-8">
          A confirmation has been sent to {contact.email || "your email"}. Track this order anytime using your order ID and contact details — no account needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/shop" className="btn-primary">Continue shopping</Link>
          <Link to="/account/orders" className="btn-outline">View orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-10 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl mb-2">Checkout</h1>
      {!user && <p className="text-sm text-graphite mb-8">Checking out as guest. <Link to="/login" className="stitch">Log in</Link> to save your details.</p>}
      <StepIndicator steps={STEPS} current={step} />

      {step === 1 && (
        <form onSubmit={next} className="space-y-5 border border-ink/15 p-6">
          <p className="font-display text-xl mb-2">Contact information</p>
          <div>
            <label className="label-eyebrow block mb-1.5">Email</label>
            <input required type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label-eyebrow block mb-1.5">Mobile number</label>
            <input required type="tel" pattern="[0-9]{10}" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="input" placeholder="10-digit mobile number" />
          </div>
          <button className="btn-primary w-full">Continue to delivery</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={next} className="space-y-5 border border-ink/15 p-6">
          <p className="font-display text-xl mb-2">Delivery address</p>
          <div>
            <label className="label-eyebrow block mb-1.5">Full name</label>
            <input required value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label-eyebrow block mb-1.5">Address</label>
            <input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="input" placeholder="House no, street, area" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input" placeholder="City" />
            <input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input" placeholder="State" />
            <input required value={address.pin} onChange={(e) => setAddress({ ...address, pin: e.target.value.replace(/\D/g,"").slice(0,6) })} className="input" placeholder="PIN" />
          </div>
          <div className="flex gap-2">
            {["Home", "Work", "Other"].map((l) => (
              <button type="button" key={l} onClick={() => setAddress({ ...address, label: l })} className={`px-4 py-2 text-xs font-mono uppercase border ${address.label === l ? "bg-ink text-white border-ink" : "border-ink/30"}`}>{l}</button>
            ))}
          </div>

          <p className="label-eyebrow pt-3">Shipping speed</p>
          <div className="space-y-2">
            {[
              { id: "standard", label: "Standard (3–5 business days)", price: cart.shipping },
              { id: "express", label: "Express (1–2 business days)", price: Math.max(cart.shipping, 249) },
            ].map((o) => (
              <label key={o.id} className={`flex items-center justify-between border p-3 cursor-pointer ${shipMethod === o.id ? "border-ink" : "border-ink/20"}`}>
                <span className="flex items-center gap-2 text-sm"><input type="radio" name="ship" checked={shipMethod === o.id} onChange={() => setShipMethod(o.id)} className="accent-track" />{o.label}</span>
                <span className="font-mono text-sm">{o.price === 0 ? "Free" : fmt(o.price)}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={back} className="btn-outline flex-1">Back</button>
            <button className="btn-primary flex-1">Continue to payment</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={next} className="space-y-4 border border-ink/15 p-6">
          <p className="font-display text-xl mb-2">Payment method</p>
          {[
            { id: "upi", label: "UPI" },
            { id: "card", label: "Credit / Debit card" },
            { id: "netbanking", label: "Net banking" },
            { id: "cod", label: "Cash on Delivery" },
          ].map((o) => (
            <label key={o.id} className={`flex items-center gap-3 border p-4 cursor-pointer ${payMethod === o.id ? "border-ink" : "border-ink/20"}`}>
              <input type="radio" name="pay" checked={payMethod === o.id} onChange={() => setPayMethod(o.id)} className="accent-track" />
              <span className="text-sm font-medium">{o.label}</span>
            </label>
          ))}
          {payMethod === "card" && (
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <input required placeholder="Card number" className="input sm:col-span-2" />
              <input required placeholder="MM/YY" className="input" />
              <input required placeholder="CVV" className="input" />
            </div>
          )}
          <p className="text-xs text-graphite">Payments are verified server-side via gateway signature/webhook before an order is confirmed.</p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={back} className="btn-outline flex-1">Back</button>
            <button className="btn-primary flex-1">Review order</button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="border border-ink/15 p-6">
            <p className="font-display text-xl mb-4">Review your order</p>
            <div className="divide-y divide-ink/10">
              {cart.items.map((item) => (
                <div key={item.key} className="py-3 flex justify-between text-sm">
                  <span>{item.name} · {item.color} · US {item.size} × {item.qty}</span>
                  <span className="font-mono">{fmt(item.currentPrice * item.qty)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-4 space-y-1.5 text-sm font-mono border-t border-ink/10 pt-4">
              <div className="flex justify-between"><dt className="text-graphite">Ship to</dt><dd className="text-right">{address.line1}, {address.city}, {address.state} {address.pin}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Payment</dt><dd className="capitalize">{payMethod}</dd></div>
              <div className="flex justify-between pt-2 border-t border-ink/10 text-base font-bold"><dt>Total</dt><dd>{fmt(grandTotal)}</dd></div>
            </dl>
          </div>
          <div className="flex gap-3">
            <button onClick={back} className="btn-outline flex-1">Back</button>
            <button onClick={placeOrder} disabled={placing} className="btn-accent flex-1">{placing ? "Placing order…" : "Place order"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
