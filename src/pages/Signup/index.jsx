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
  Siren,
  MapPin,
  TriangleAlert,
  UserPlus,
} from "lucide-react";
import hawkvision1 from "../../assets/hawkvision1.svg";
import { useAuth } from "../../context/AuthContext";

function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const {
      fullName,
      email,
      username,
      password,
      confirmPassword,
    } = formData;

    if (!fullName || !email || !username || !password || !confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      await signup({
        fullName,
        email,
        username,
        password,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080F1E] text-[#F1F5F9] flex overflow-hidden">

      {/* =====================================================
          LEFT — RESCUE NETWORK
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

        {/* Water / blue glow */}
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[#3B82F6]/10 blur-[130px]" />

        {/* Red emergency glow */}
        <div className="absolute bottom-[5%] right-[5%] w-[320px] h-[320px] rounded-full bg-[#EF3340]/5 blur-[110px]" />

        {/* Radar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[260px] h-[260px] rounded-full border border-[#3B82F6]/10" />
          <div className="absolute w-[410px] h-[410px] rounded-full border border-[#3B82F6]/[0.06]" />
          <div className="absolute w-[570px] h-[570px] rounded-full border border-[#3B82F6]/[0.035]" />
        </div>

        <div className="relative z-10 w-full max-w-xl px-12">

          {/* Network status */}
          <div className="flex justify-center mb-9">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/5">

              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-50 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>

              <span className="text-[9px] uppercase tracking-[0.2em] text-[#8FA4C7]">
                Response Network Online
              </span>

            </div>
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

          {/* Heading */}
          <div className="text-center">

            <p className="text-[11px] uppercase tracking-[0.35em] text-[#3B82F6] font-semibold mb-3">
              Join The Mission
            </p>

            <h2 className="text-4xl font-extrabold tracking-tight mb-4">
              Join the Rescue Network
            </h2>

            <p className="text-sm leading-7 text-[#8FA4C7] max-w-lg mx-auto">
              Become part of an AI-powered emergency response network built
              to help communities detect threats, coordinate rescue teams,
              and protect lives during disasters.
            </p>

          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 mt-9">

            <div className="rounded-xl border border-[#1D304D] bg-[#111C31]/70 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                  <Waves size={17} className="text-[#3B82F6]" />
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    Flood Monitoring
                  </p>

                  <p className="text-[10px] text-[#64748B]">
                    Detect rising risk
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-xl border border-[#1D304D] bg-[#111C31]/70 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/20 flex items-center justify-center">
                  <Siren size={17} className="text-[#EF3340]" />
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    Emergency Alerts
                  </p>

                  <p className="text-[10px] text-[#64748B]">
                    Critical warnings
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-xl border border-[#1D304D] bg-[#111C31]/70 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center">
                  <Radio size={17} className="text-[#22C55E]" />
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    Live Coordination
                  </p>

                  <p className="text-[10px] text-[#64748B]">
                    Response operations
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-xl border border-[#1D304D] bg-[#111C31]/70 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                  <MapPin size={17} className="text-[#3B82F6]" />
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    Rescue Mapping
                  </p>

                  <p className="text-[10px] text-[#64748B]">
                    Safe locations
                  </p>
                </div>

              </div>
            </div>

          </div>

          <div className="text-center mt-7">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#64748B]">
              Every Second Matters · Every Life Counts
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          RIGHT — SIGN UP FORM
      ===================================================== */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-7">
            <img
              src={hawkvision1}
              alt="HawkVision AI"
              className="h-11 w-auto"
            />
          </div>

          {/* Heading */}
          <div className="mb-7">

            <div className="flex items-center gap-2 mb-4">

              <div className="w-8 h-8 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/20 flex items-center justify-center">
                <UserPlus size={16} className="text-[#EF3340]" />
              </div>

              <span className="text-[10px] uppercase tracking-[0.2em] text-[#EF3340] font-semibold">
                Emergency Network Registration
              </span>

            </div>

            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Create Your Account
            </h1>

            <p className="text-sm text-[#8FA4C7] leading-6">
              Join HawkVision AI and become part of the emergency response
              network.
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

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full name */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#64748B] font-bold mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full h-11 bg-[#111C31] border border-[#1D304D] rounded-xl px-4 text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 hover:border-[#2A4163]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#64748B] font-bold mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full h-11 bg-[#111C31] border border-[#1D304D] rounded-xl px-4 text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 hover:border-[#2A4163]"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#64748B] font-bold mb-2">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="w-full h-11 bg-[#111C31] border border-[#1D304D] rounded-xl px-4 text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 hover:border-[#2A4163]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#64748B] font-bold mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  className="w-full h-11 bg-[#111C31] border border-[#1D304D] rounded-xl px-4 pr-11 text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 hover:border-[#2A4163]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9]"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#64748B] font-bold mb-2">
                Confirm Password
              </label>

              <div className="relative">

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full h-11 bg-[#111C31] border border-[#1D304D] rounded-xl px-4 pr-11 text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 hover:border-[#2A4163]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer pt-1">

              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#3B82F6]"
              />

              <span className="text-xs leading-5 text-[#8FA4C7]">
                I agree to the{" "}
                <span className="text-[#3B82F6] font-medium">
                  Terms & Conditions
                </span>{" "}
                and emergency network guidelines.
              </span>

            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 mt-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/35"
            >
              <span className="flex items-center justify-center gap-2">

                {loading ? "CREATING ACCOUNT..." : "JOIN RESCUE NETWORK"}

                {!loading && (
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}

              </span>
            </button>

          </form>

          {/* Login */}
          <div className="mt-6 text-center">

            <p className="text-sm text-[#8FA4C7]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#3B82F6] hover:text-[#60A5FA] font-semibold"
              >
                Login
              </Link>
            </p>

          </div>

          {/* Security */}
          <div className="mt-7 pt-5 border-t border-[#1D304D]/70">

            <div className="flex items-center justify-center gap-2">
              <Lock size={12} className="text-[#22C55E]" />

              <span className="text-[9px] tracking-[0.2em] uppercase text-[#64748B]">
                Secure Emergency Network
              </span>
            </div>

            <div className="text-center mt-4">

              <Link
                to="/"
                className="text-[11px] text-[#64748B] hover:text-[#8FA4C7]"
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

export default SignUp;