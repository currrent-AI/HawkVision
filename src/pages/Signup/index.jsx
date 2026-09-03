import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import hawkvision1 from "../../assets/hawkvision1.svg";
import { useAuth } from "../../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const update = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.username || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!form.agree) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      await signup({
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        password: form.password
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080F1E] flex">
      {/* ============ LEFT: BRANDING ============ */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden border-r border-[#1D304D]/30">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#3B82F6]/[0.06] blur-[100px] pointer-events-none" />

        {/* Radar rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-48 h-48 rounded-full border border-[#3B82F6]/10"
            style={{ animation: "hv-glow 3s ease-in-out infinite" }}
          />
          <div
            className="absolute w-72 h-72 rounded-full border border-[#3B82F6]/[0.06]"
            style={{ animation: "hv-glow 3s ease-in-out infinite 1s" }}
          />
          <div
            className="absolute w-96 h-96 rounded-full border border-[#3B82F6]/[0.03]"
            style={{ animation: "hv-glow 3s ease-in-out infinite 2s" }}
          />
        </div>

        <div className="relative z-10 text-center px-12">
          <img
            src={hawkvision1}
            alt="HawkVision AI"
            className="w-48 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          />

          <h2 className="text-2xl font-bold text-[#F1F5F9] tracking-tight mb-3">
            Join the Response Network
          </h2>

          <p className="text-sm text-[#8FA4C7] leading-relaxed max-w-sm mx-auto mb-8">
            Become part of Pakistan's AI-powered emergency response
            infrastructure. Coordinate faster, respond smarter, save lives.
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            {[
              { label: "Real-time disaster monitoring" },
              { label: "AI victim detection system" },
              { label: "Emergency coordination tools" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[#1D304D] bg-[#111C31]/40"
              >
                <Shield size={14} className="text-[#3B82F6] flex-shrink-0" />
                <span className="text-xs text-[#8FA4C7]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ RIGHT: FORM ============ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={hawkvision1} alt="HawkVision AI" className="h-10 w-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#F1F5F9] tracking-tight mb-2">
              CREATE YOUR ACCOUNT
            </h1>
            <p className="text-sm text-[#8FA4C7]">
              Join HawkVision AI and become part of the emergency response
              network.
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/30 text-sm text-[#EF3340]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] text-[#64748B] tracking-wide uppercase font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={update("fullName")}
                placeholder="Enter your full name"
                className="w-full bg-[#111C31] border border-[#1D304D] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] text-[#64748B] tracking-wide uppercase font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="Enter your email"
                className="w-full bg-[#111C31] border border-[#1D304D] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-[11px] text-[#64748B] tracking-wide uppercase font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={update("username")}
                placeholder="Choose a username"
                className="w-full bg-[#111C31] border border-[#1D304D] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] text-[#64748B] tracking-wide uppercase font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Create a password"
                  className="w-full bg-[#111C31] border border-[#1D304D] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#8FA4C7] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] text-[#64748B] tracking-wide uppercase font-semibold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  placeholder="Confirm your password"
                  className="w-full bg-[#111C31] border border-[#1D304D] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#8FA4C7] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={update("agree")}
                className="mt-0.5 w-3.5 h-3.5 rounded border-[#1D304D] bg-[#111C31] accent-[#3B82F6]"
              />
              <span className="text-xs text-[#8FA4C7]">
                I agree to the{" "}
                <span className="text-[#3B82F6] cursor-pointer hover:underline">
                  Terms &amp; Conditions
                </span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-lg transition-all shadow-lg shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/40"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-[#8FA4C7] mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#3B82F6] hover:text-[#2563EB] font-semibold transition-colors"
            >
              Login
            </Link>
          </p>

          {/* Security indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <Lock size={12} className="text-[#22C55E]" />
            <span className="text-[10px] tracking-[0.15em] text-[#64748B] uppercase">
              Secure Connection
            </span>
          </div>

          {/* Back to landing */}
          <div className="text-center mt-4">
            <Link
              to="/"
              className="text-[11px] text-[#64748B] hover:text-[#8FA4C7] transition-colors"
            >
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
