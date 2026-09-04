import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    login(email);
    push("Logged in");
    navigate("/account");
  };

  return (
    <div className="container-x py-16 max-w-md mx-auto">
      <p className="label-eyebrow mb-2">Welcome back</p>
      <h1 className="font-display text-4xl mb-8">Log in</h1>
      <form onSubmit={submit} className="space-y-4 border border-ink/15 p-6">
        <div>
          <label className="label-eyebrow block mb-1.5">Email or mobile</label>
          <input required type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@email.com" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label-eyebrow">Password</label>
            <Link to="/forgot-password" className="stitch text-xs">Forgot?</Link>
          </div>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        <button className="btn-primary w-full">Log in</button>
        <button type="button" className="btn-outline w-full">Continue with Google</button>
        <p className="text-xs text-graphite text-center">Tip: use an email containing "admin" to preview the admin dashboard.</p>
      </form>
      <p className="text-sm text-graphite mt-6 text-center">New here? <Link to="/register" className="stitch text-ink">Create an account</Link></p>
      <p className="text-sm text-graphite mt-2 text-center"><Link to="/shop" className="stitch text-ink">Continue as guest →</Link></p>
    </div>
  );
}
