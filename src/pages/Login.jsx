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
    push("Logged in successfully");
    navigate("/account");
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* Left Branding Panel */}
        <div
          className="hidden md:flex flex-col justify-center p-12 text-white"
          style={{
            background:
              "linear-gradient(135deg, #0B1F4D 0%, #142F73 60%, #FF6B1A 100%)",
          }}
        >
          <p className="uppercase tracking-[0.35em] text-sm mb-4">
            SOLESPACE
          </p>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Premium
            <br />
            Footwear
            <br />
            For Every Journey
          </h1>

          <p className="text-lg text-white/90 leading-relaxed">
            Discover trending sneakers, running shoes, casual wear and
            exclusive collections from top brands.
          </p>

          <div className="mt-10 space-y-3 text-white/85">
            <p>✓ Premium Brands</p>
            <p>✓ Secure Checkout</p>
            <p>✓ Fast Delivery</p>
            <p>✓ Exclusive Collections</p>
          </div>

          {/* Optional Shoe Image */}
          {/*
          <img
            src={shoeImage}
            alt="Premium Shoe"
            className="mt-10 w-full max-w-sm"
          />
          */}
        </div>

        {/* Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <p className="uppercase tracking-[0.3em] text-xs text-gray-500 mb-2">
            Welcome Back
          </p>

          <h2 className="text-4xl font-bold text-slate-900 mb-2">
            Sign In
          </h2>

          <p className="text-gray-500 mb-8">
            Continue shopping with your SoleSpace account.
          </p>

          <form onSubmit={submit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Mobile
              </label>

              <input
                required
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm hover:underline"
                  style={{ color: "#FF6B1A" }}
                >
                  Forgot Password?
                </Link>
              </div>

              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full text-white py-3 rounded-xl font-semibold transition hover:opacity-90"
              style={{ backgroundColor: "#FF6B1A" }}
            >
              Sign In
            </button>

            <div className="relative py-2">
              <div className="border-t border-gray-300"></div>

              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="w-full border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.7 15.3 18.9 12 24 12c3 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.4C9.7 38.8 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.1 7.1l6.3 5.3C39.3 37.1 44 31.1 44 24c0-1.3-.1-2.4-.4-3.5z"
                />
              </svg>

              <span className="font-medium">
                Continue with Google
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            New here?{" "}
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: "#FF6B1A" }}
            >
              Create an account
            </Link>
          </p>

          <p className="mt-3 text-center text-sm">
            <Link
              to="/shop"
              className="text-gray-700 hover:text-orange-600"
            >
              Continue as Guest →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}