import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;

export default function Cart() {
  const cart = useCart();
  const { push } = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const onApply = (e) => {
    e.preventDefault();
    const res = cart.applyCoupon(code);
    push(res.ok ? `Coupon applied: ${cart.coupon?.label ?? ""}` : res.message);
  };

  if (cart.items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <p className="font-display text-3xl mb-3">Your cart is empty</p>
        <p className="text-graphite mb-8">Nothing here yet — go find your next pair.</p>
        <Link to="/shop" className="btn-primary">Shop shoes</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-4xl mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 divide-y divide-ink/10 border-y border-ink/10">
          {cart.items.map((item) => (
            <div key={item.key} className="py-5 flex gap-4">
              <Link to={`/product/${item.slug}`} className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 bg-haze overflow-hidden">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="label-eyebrow">{item.brand}</p>
                    <Link to={`/product/${item.slug}`} className="font-semibold">{item.name}</Link>
                    <p className="text-sm text-graphite mt-1">{item.color} · US {item.size}</p>
                  </div>
                  <button onClick={() => cart.removeItem(item.key)} className="text-graphite hover:text-cone text-sm shrink-0" aria-label="Remove item">✕</button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-ink/20">
                    <button onClick={() => cart.updateQty(item.key, item.qty - 1)} className="w-8 h-8 font-mono" aria-label="Decrease quantity">−</button>
                    <span className="w-8 text-center font-mono text-sm">{item.qty}</span>
                    <button onClick={() => cart.updateQty(item.key, item.qty + 1)} className="w-8 h-8 font-mono" aria-label="Increase quantity">+</button>
                  </div>
                  <span className="font-mono font-bold">{fmt(item.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="border border-ink/15 p-6">
            <p className="font-display text-xl mb-4">Order Summary</p>
            <form onSubmit={onApply} className="flex gap-2 mb-5">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="input" />
              <button className="btn-outline shrink-0 !px-4 text-xs">Apply</button>
            </form>
            {cart.coupon && (
              <div className="flex justify-between items-center mb-4 stamp bg-traction/30 border-ink w-full">
                <span>{cart.coupon.label}</span>
                <button onClick={cart.removeCoupon} aria-label="Remove coupon">✕</button>
              </div>
            )}
            <dl className="space-y-2 text-sm font-mono">
              <div className="flex justify-between"><dt className="text-graphite">Subtotal</dt><dd>{fmt(cart.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Discount</dt><dd className="text-cone">−{fmt(cart.discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Shipping</dt><dd>{cart.shipping === 0 ? "Free" : fmt(cart.shipping)}</dd></div>
              <div className="flex justify-between pt-3 border-t border-ink/15 text-base font-bold"><dt>Total</dt><dd>{fmt(cart.total)}</dd></div>
            </dl>
            <button onClick={() => navigate("/checkout")} className="btn-primary w-full mt-6">Checkout</button>
            <p className="text-xs text-graphite text-center mt-3">Guest checkout available — no account required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
