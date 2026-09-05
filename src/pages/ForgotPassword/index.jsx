import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Waves,
} from "lucide-react";
import hawkvision1 from "../../assets/hawkvision1.svg";
import { useAuth } from "../../context/AuthContext";

function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    // Basic validation
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const data = await forgotPassword(normalizedEmail);

      setSuccess(
        data?.message ||
          "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to process your request. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080F1E] text-[#F1F5F9] flex overflow-hidden">

      {/* =====================================================
          LEFT — RESCUE COMMAND CENTER VISUAL
      ====================================================== */}

      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden border-r border-[#1D304D]/40">

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Ambient Glow */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#3B82F6]/[0.06] blur-[110px]" />

        {/* Radar Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

          <div className="w-[520px] h-[520px] rounded-full border border-[#3B82F6]/[0.08]" />

          <div className="absolute w-[430px] h-[430px] rounded-full border border-[#3B82F6]/10" />

          <div className="absolute w-[300px] h-[300px] rounded-full border border-[#3B82F6]/10" />

          <div className="absolute w-[170px] h-[170px] rounded-full border border-[#EF3340]/10" />

          {/* Radar center */}
          <div className="absolute w-2 h-2 rounded-full bg-[#EF3340] shadow-[0_0_20px_rgba(239,51,64,0.7)]" />
        </div>

        {/* Decorative radar lines */}
        <div className="absolute left-1/2 top-1/2 w-[430px] h-px bg-[#3B82F6]/10 -translate-x-1/2 -translate-y-1/2" />

        <div className="absolute left-1/2 top-1/2 h-[430px] w-px bg-[#3B82F6]/10 -translate-x-1/2 -translate-y-1/2" />

        {/* Main Content */}
        <div className="relative z-10 text-center px-12 max-w-xl">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={hawkvision1}
              alt="HawkVision AI"
              className="w-48 drop-shadow-[0_0_30px_rgba(59,130,246,0.25)]"
            />
          </div>

          {/* Secure Status */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/5">

            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-50 animate-ping" />

              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#22C55E]" />
            </span>

            <span className="text-[10px] tracking-[0.18em] text-[#22C55E] uppercase">
              Emergency Network Secure
            </span>

          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold mb-4 tracking-tight">
            Restore Your{" "}
            <span className="text-[#3B82F6]">
              Response Access
            </span>
          </h2>

          {/* Description */}
          <p className="text-sm leading-7 text-[#8FA4C7] max-w-md mx-auto">
            Securely recover your HawkVision
            command-center account and get back
            to coordinating emergency response
            operations.
          </p>

          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-3 mt-9">

            {/* Flood */}
            <div className="group p-4 rounded-xl border border-[#1D304D] bg-[#111C31]/60 backdrop-blur-sm transition-all duration-300 hover:border-[#3B82F6]/40 hover:bg-[#111C31]">

              <Waves
                size={18}
                className="mx-auto mb-2 text-[#3B82F6] group-hover:scale-110 transition-transform"
              />

              <span className="text-[10px] tracking-wide text-[#8FA4C7]">
                FLOOD
              </span>

            </div>

            {/* Secure */}
            <div className="group p-4 rounded-xl border border-[#1D304D] bg-[#111C31]/60 backdrop-blur-sm transition-all duration-300 hover:border-[#22C55E]/40 hover:bg-[#111C31]">

              <ShieldCheck
                size={18}
                className="mx-auto mb-2 text-[#22C55E] group-hover:scale-110 transition-transform"
              />

              <span className="text-[10px] tracking-wide text-[#8FA4C7]">
                SECURE
              </span>

            </div>

            {/* Access */}
            <div className="group p-4 rounded-xl border border-[#1D304D] bg-[#111C31]/60 backdrop-blur-sm transition-all duration-300 hover:border-[#EF3340]/40 hover:bg-[#111C31]">

              <LockKeyhole
                size={18}
                className="mx-auto mb-2 text-[#EF3340] group-hover:scale-110 transition-transform"
              />

              <span className="text-[10px] tracking-wide text-[#8FA4C7]">
                ACCESS
              </span>

            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          RIGHT — RECOVERY FORM
      ====================================================== */}

      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <img
              src={hawkvision1}
              alt="HawkVision AI"
              className="h-10 w-auto"
            />
          </div>

          {/* Heading */}
          <div className="mb-8">

            <div className="flex items-center gap-2 text-[#3B82F6] text-[10px] tracking-[0.2em] uppercase font-semibold mb-4">

              <LockKeyhole size={13} />

              <span>
                Account Recovery
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-3">
              RESET ACCESS
            </h1>

            <p className="text-sm leading-6 text-[#8FA4C7]">
              Enter your registered email and
              we'll send a secure password reset
              link.
            </p>

          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/30 text-sm text-[#EF3340]"
            >
              <div className="flex items-start gap-3">

                <LockKeyhole
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>

              </div>
            </div>
          )}

          {/* =================================================
              SUCCESS MESSAGE
          ================================================== */}

          {success && (
            <div
              role="status"
              className="mb-5 p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-sm text-[#22C55E]"
            >
              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {success}
                </span>

              </div>
            </div>
          )}

          {/* =================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="recovery-email"
                className="block text-[11px] uppercase tracking-wide text-[#64748B] font-semibold mb-2"
              >
                Registered Email
              </label>

              <div className="relative">

                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
                />

                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    // Clear old messages while typing
                    if (error) {
                      setError("");
                    }

                    if (success) {
                      setSuccess("");
                    }
                  }}
                  placeholder="Enter your email"
                  disabled={loading}
                  className="w-full bg-[#111C31] border border-[#1D304D] rounded-xl pl-11 pr-4 py-3.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#3B82F6]/20"
            >

              <span>
                {loading
                  ? "SENDING RESET LINK..."
                  : "SEND RESET LINK"}
              </span>

              {!loading && (
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}

            </button>

          </form>

          {/* Back to Login */}
          <div className="flex justify-center mt-7">

            <Link
              to="/login"
              className="group flex items-center gap-2 text-xs text-[#8FA4C7] hover:text-[#F1F5F9] transition-colors"
            >

              <ArrowLeft
                size={13}
                className="group-hover:-translate-x-1 transition-transform"
              />

              <span>
                Back to Login
              </span>

            </Link>

          </div>

          {/* Secure Channel */}
          <div className="flex items-center justify-center gap-2 mt-10">

            <LockKeyhole
              size={12}
              className="text-[#22C55E]"
            />

            <span className="text-[10px] tracking-[0.15em] text-[#64748B] uppercase">
              Secure Recovery Channel
            </span>

          </div>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;