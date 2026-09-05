import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import hawkvision1 from "../../assets/hawkvision1.svg";
import { useAuth } from "../../context/AuthContext";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirm, setShowConfirm] =
    useState(false);

  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Invalid password reset link."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const data =
        await resetPassword(
          token,
          password
        );

      setSuccess(
        data.message ||
          "Password reset successful."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(
        err.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080F1E] text-[#F1F5F9] flex">

      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden border-r border-[#1D304D]/40">

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
            backgroundSize:
              "50px 50px",
          }}
        />

        <div className="absolute w-[520px] h-[520px] rounded-full bg-[#3B82F6]/[0.05] blur-[120px]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[430px] h-[430px] rounded-full border border-[#3B82F6]/10" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-[#EF3340]/10" />
        </div>

        <div className="relative z-10 text-center px-12">

          <img
            src={hawkvision1}
            alt="HawkVision AI"
            className="w-48 mx-auto mb-9"
          />

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/5 mb-6">
            <ShieldCheck
              size={13}
              className="text-[#22C55E]"
            />
            <span className="text-[10px] tracking-[0.18em] text-[#22C55E] uppercase">
              Secure Recovery
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Secure Your
            <span className="text-[#3B82F6]">
              {" "}Command Access
            </span>
          </h2>

          <p className="text-sm leading-7 text-[#8FA4C7] max-w-md">
            Create a new password and return
            to the HawkVision emergency
            response command center.
          </p>

        </div>
      </div>

      {/* FORM */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          <div className="lg:hidden flex justify-center mb-10">
            <img
              src={hawkvision1}
              alt="HawkVision AI"
              className="h-10 w-auto"
            />
          </div>

          <div className="mb-8">

            <div className="flex items-center gap-2 text-[#3B82F6] text-[10px] tracking-[0.2em] uppercase font-semibold mb-4">
              <LockKeyhole size={13} />
              Secure Password Recovery
            </div>

            <h1 className="text-3xl font-bold mb-3">
              CREATE NEW PASSWORD
            </h1>

            <p className="text-sm text-[#8FA4C7] leading-6">
              Choose a new secure password for
              your HawkVision account.
            </p>

          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/30 text-sm text-[#EF3340]">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-sm text-[#22C55E] flex gap-3">
              <CheckCircle2
                size={18}
                className="flex-shrink-0"
              />
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* PASSWORD */}
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-[#64748B] font-semibold mb-2">
                New Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                  className="w-full bg-[#111C31] border border-[#1D304D] rounded-xl pl-11 pr-11 py-3.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9]"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>
            </div>

            {/* CONFIRM */}
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-[#64748B] font-semibold mb-2">
                Confirm Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                />

                <input
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  className="w-full bg-[#111C31] border border-[#1D304D] rounded-xl pl-11 pr-11 py-3.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(
                      !showConfirm
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9]"
                >
                  {showConfirm ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#3B82F6]/20"
            >
              {loading
                ? "UPDATING PASSWORD..."
                : "UPDATE PASSWORD"}

              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

          </form>

          <div className="flex items-center justify-center gap-2 mt-9">
            <LockKeyhole
              size={12}
              className="text-[#22C55E]"
            />
            <span className="text-[10px] tracking-[0.15em] text-[#64748B] uppercase">
              Secure Recovery Channel
            </span>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-xs text-[#64748B] hover:text-[#8FA4C7]"
            >
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;