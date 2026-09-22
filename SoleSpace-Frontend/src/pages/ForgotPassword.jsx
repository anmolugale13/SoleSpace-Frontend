import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { push } = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/forgot-password/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      push("OTP sent successfully");
      setStep(2);
    } catch (error) {
      push(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      push("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/forgot-password/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      push("OTP verified successfully");
      setStep(3);
    } catch (error) {
      push(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      push("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      push("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/forgot-password/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      push("Password reset successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      push(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* Left Panel */}
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
            Reset Your
            <br />
            Password
          </h1>

          <p className="text-lg text-white/90 leading-relaxed">
            Securely recover your SoleSpace account and continue your
            shopping journey.
          </p>

          <div className="mt-10 space-y-3 text-white/85">
            <p>✓ Secure OTP Verification</p>
            <p>✓ Protected Account</p>
            <p>✓ Quick Password Reset</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="p-8 md:p-12 flex flex-col justify-center">

          {/* Step 1 */}
          {step === 1 && (
            <>
              <p className="uppercase tracking-[0.3em] text-xs text-gray-500 mb-2">
                Account Recovery
              </p>

              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                Forgot Password?
              </h2>

              <p className="text-gray-500 mb-8">
                Enter your registered email address and we'll send you an OTP.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>

                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-xl font-semibold transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#FF6B1A" }}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold hover:underline"
                  style={{ color: "#FF6B1A" }}
                >
                  Back to Login
                </button>
              </p>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <p className="uppercase tracking-[0.3em] text-xs text-gray-500 mb-2">
                Verify Identity
              </p>

              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                Enter OTP
              </h2>

              <p className="text-gray-500 mb-8">
                We've sent a 6-digit OTP to{" "}
                <span className="font-medium text-slate-800">
                  {email}
                </span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP
                  </label>

                  <input
                    required
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter 6-digit OTP"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center tracking-[0.5em] text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-xl font-semibold transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#FF6B1A" }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-6 w-full text-sm text-gray-600 hover:text-orange-600"
              >
                ← Change Email
              </button>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <p className="uppercase tracking-[0.3em] text-xs text-gray-500 mb-2">
                Create New Password
              </p>

              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                Reset Password
              </h2>

              <p className="text-gray-500 mb-8">
                Create a new password for your SoleSpace account.
              </p>

              <form
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>

                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>

                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-xl font-semibold transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#FF6B1A" }}
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}