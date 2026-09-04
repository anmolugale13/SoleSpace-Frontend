import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = (e) => {
    e.preventDefault();
    register(form.name, form.email);
    push("Account created");
    navigate("/account");
  };

  return (
    <div className="container-x py-16 max-w-md mx-auto">
      <p className="label-eyebrow mb-2">Registration is optional</p>
      <h1 className="font-display text-4xl mb-2">Create an account</h1>
      <p className="text-sm text-graphite mb-8">Unlock saved addresses, order history, wishlist sync and loyalty points. You can always check out as a guest instead.</p>
      <form onSubmit={submit} className="space-y-4 border border-ink/15 p-6">
        <div>
          <label className="label-eyebrow block mb-1.5">Full name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label-eyebrow block mb-1.5">Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label-eyebrow block mb-1.5">Password</label>
          <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        </div>
        <button className="btn-primary w-full">Create account</button>
      </form>
      <p className="text-sm text-graphite mt-6 text-center">Already have an account? <Link to="/login" className="stitch text-ink">Log in</Link></p>
    </div>
  );
}
