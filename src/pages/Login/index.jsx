import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Waves,
  Radio,
  MapPin,
  TriangleAlert,
} from "lucide-react";
import hawkvision1 from "../../assets/hawkvision1.svg";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email/username and password.");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080F1E] text-[#F1F5F9] flex overflow-hidden">

      {/* =====================================================
          LEFT — FLOOD RESCUE BRANDING
      ===================================================== */}
      <div className="hidden lg:flex lg:w-[52%] relative items-center justify-center overflow-hidden border-r border-[#1D304D]">

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Blue atmospheric glow */}
        <div className="absolute top-[20%] left-[25%] w-[420px] h-[420px] bg-[#3B82F6]/10 rounded-full blur-[120px]" />

        {/* Emergency red glow */}
        <div className="absolute bottom-[5%] right-[10%] w-[280px] h-[280px] bg-[#EF3340]/5 rounded-full blur-[100px]" />

        {/* Radar circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[270px] h-[270px] rounded-full border border-[#3B82F6]/10" />
          <div className="absolute w-[430px] h-[430px] rounded-full border border-[#3B82F6]/[0.06]" />
          <div className="absolute w-[590px] h-[590px] rounded-full border border-[#3B82F6]/[0.035]" />
        </div>

        {/* Radar line */}
        <div
          className="absolute left-1/2 top-1/2 w-[295px] h-px origin-left bg-gradient-to-r from-[#3B82F6]/40 to-transparent"
          style={{
            transform: "rotate(-25deg)",
          }}
        />

        <div className="relative z-10 w-full max-w-xl px-12">

          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-50 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            </span>

            <span className="text-[10px] tracking-[0.25em] uppercase text-[#8FA4C7]">
              National Emergency Network · Online
            </span>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-7">
            <div className="relative">
              <div className="absolute inset-0 bg-[#3B82F6]/20 blur-2xl rounded-full" />

              <img
                src={hawkvision1}
                alt="HawkVision AI"
                className="relative w-52 drop-shadow-[0_0_25px_rgba(59,130,246,0.25)]"
              />
            </div>
          </div>

          {/* Main title */}
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#3B82F6] font-semibold mb-3">
              AI Disaster Response
            </p>

            <h2 className="text-4xl font-extrabold tracking-tight mb-4">
              Disaster Command Center
            </h2>

            <p className="text-sm leading-7 text-[#8FA4C7] max-w-lg mx-auto">
              Monitor flood threats, locate survivors, coordinate rescue
              operations, and respond faster with AI-powered emergency
              intelligence.
            </p>
          </div>

          {/* Emergency feature cards */}
          <div className="grid grid-cols-2 gap-3 mt-9">

            <div className="group rounded-xl border border-[#1D304D] bg-[#111C31]/70 backdrop-blur-md p-4 hover:border-[#3B82F6]/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                  <Waves size={17} className="text-[#3B82F6]" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#F1F5F9]">
                    Flood Intelligence
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    Risk monitoring
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-xl border border-[#1D304D] bg-[#111C31]/70 backdrop-blur-md p-4 hover:border-[#22C55E]/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center">
                  <Radio size={17} className="text-[#22C55E]" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#F1F5F9]">
                    Live Response
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    Real-time coordination
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-xl border border-[#1D304D] bg-[#111C31]/70 backdrop-blur-md p-4 hover:border-[#EF3340]/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/20 flex items-center justify-center">
                  <TriangleAlert size={17} className="text-[#EF3340]" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#F1F5F9]">
                    Emergency Alerts
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    Critical warnings
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-xl border border-[#1D304D] bg-[#111C31]/70 backdrop-blur-md p-4 hover:border-[#3B82F6]/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                  <MapPin size={17} className="text-[#3B82F6]" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#F1F5F9]">
                    Rescue Mapping
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    Safe locations
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom statement */}
          <div className="mt-7 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#64748B]">
              Protect · Respond · Rescue · Recover
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          RIGHT — LOGIN
      ===================================================== */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src={hawkvision1}
              alt="HawkVision AI"
              className="h-12 w-auto"
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                <Shield size={16} className="text-[#3B82F6]" />
              </div>

              <span className="text-[10px] uppercase tracking-[0.2em] text-[#3B82F6] font-semibold">
                Secure Access
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Welcome Back
            </h1>

            <p className="text-sm text-[#8FA4C7]">
              Access your HawkVision emergency command center.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex gap-3 p-4 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/25">
              <TriangleAlert
                size={17}
                className="text-[#EF3340] mt-0.5 flex-shrink-0"
              />

              <p className="text-xs leading-5 text-[#EF3340]">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Identifier */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#64748B] font-bold mb-2">
                Email or Username
              </label>

              <div className="relative">
                <Shield
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                />

                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email or username"
                  className="w-full h-12 bg-[#111C31] border border-[#1D304D] rounded-xl pl-11 pr-4 text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 hover:border-[#2A4163]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#64748B] font-bold mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 bg-[#111C31] border border-[#1D304D] rounded-xl pl-11 pr-12 text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 hover:border-[#2A4163]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#3B82F6]"
                />

                <span className="text-xs text-[#8FA4C7]">
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors"
              >
                Forgot password?
              </Link>

            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-12 rounded-xl overflow-hidden bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/35"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "AUTHENTICATING..." : "ENTER COMMAND CENTER"}

                {!loading && (
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </span>
            </button>

          </form>

          {/* Signup */}
          <div className="mt-7 text-center">
            <p className="text-sm text-[#8FA4C7]">
              Don't have an emergency network account?{" "}
              <Link
                to="/signup"
                className="text-[#3B82F6] hover:text-[#60A5FA] font-semibold"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Security */}
          <div className="mt-8 pt-6 border-t border-[#1D304D]/70">

            <div className="flex items-center justify-center gap-2">
              <Lock size={12} className="text-[#22C55E]" />

              <span className="text-[9px] uppercase tracking-[0.22em] text-[#64748B]">
                Encrypted Emergency Network
              </span>
            </div>

            <div className="text-center mt-4">
              <Link
                to="/"
                className="text-[11px] text-[#64748B] hover:text-[#8FA4C7] transition-colors"
              >
                ← Back to HawkVision
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;