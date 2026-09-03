import { useState } from "react";
import {
  ShieldAlert,
  MapPin,
  Radio,
  Users,
  Phone,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Clock3,
  X,
} from "lucide-react";

function SOS() {
  const [sosActive, setSosActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [severity, setSeverity] = useState("Critical");

  const activateSOS = () => {
    setShowConfirm(false);
    setSosActive(true);
  };

  const cancelSOS = () => {
    setSosActive(false);
  };

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 mb-2">

            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-red-400" />
            </span>

            <p className="text-xs text-red-400 tracking-[0.18em] font-semibold">
              EMERGENCY RESPONSE CONTROL
            </p>

          </div>

          <h1 className="text-3xl font-bold text-[#F8FAFC]">
            SOS Emergency Center
          </h1>

          <p className="text-[#8FA4C7] mt-2">
            Initiate and monitor priority emergency response operations.
          </p>
        </div>

        {/* Network status */}

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1628] border border-[#1D304D]">

          <Radio
            size={16}
            className="text-emerald-400"
          />

          <span className="text-xs text-[#8FA4C7]">
            Response Network
          </span>

          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Connected
          </span>

        </div>

      </div>

      {/* ================= ACTIVE SOS BANNER ================= */}

      {sosActive && (

        <div className="relative overflow-hidden bg-red-400/[0.06] border border-red-400/30 rounded-2xl p-5">

          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-red-400/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="relative">

                <span className="absolute -inset-2 rounded-full bg-red-400/20 animate-ping" />

                <div className="relative w-12 h-12 rounded-xl bg-red-400/10 border border-red-400/30 flex items-center justify-center">

                  <ShieldAlert
                    size={24}
                    className="text-red-400"
                  />

                </div>

              </div>

              <div>
                <p className="text-xs text-red-400 font-semibold tracking-wide">
                  SOS SIGNAL ACTIVE
                </p>

                <h2 className="text-lg font-semibold text-[#F8FAFC] mt-1">
                  Emergency response has been initiated
                </h2>

                <p className="text-xs text-[#8FA4C7] mt-1">
                  Rescue network has been notified of the incident.
                </p>
              </div>

            </div>

            <button
              onClick={cancelSOS}
              className="px-4 py-2.5 rounded-lg bg-[#16233A] border border-[#1D304D] text-xs text-[#C8D5EA] hover:bg-red-400 hover:text-white hover:border-red-400 transition"
            >
              Cancel SOS
            </button>

          </div>

        </div>

      )}

      {/* ================= MAIN GRID ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ================= SOS CONTROL ================= */}

        <div className="xl:col-span-2 bg-[#0D1628] border border-[#1D304D] rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-[#1D304D] flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">
                Emergency Activation
              </h2>

              <p className="text-xs text-[#7185A7] mt-1">
                Trigger a priority rescue response
              </p>
            </div>

            <ShieldAlert
              size={20}
              className="text-red-400"
            />

          </div>

          <div className="p-8">

            {/* SOS Button */}

            <div className="flex justify-center">

              <div className="relative">

                {!sosActive && (
                  <>
                    <span className="absolute -inset-8 rounded-full border border-red-400/10 animate-ping" />
                    <span className="absolute -inset-5 rounded-full border border-red-400/10" />
                  </>
                )}

                <button
                  onClick={() => !sosActive && setShowConfirm(true)}
                  disabled={sosActive}
                  className={`relative w-52 h-52 rounded-full border-[8px] flex flex-col items-center justify-center transition-all ${
                    sosActive
                      ? "bg-red-400/10 border-red-400/40 cursor-default"
                      : "bg-red-400/10 border-red-400/20 hover:bg-red-400/20 hover:border-red-400/40 hover:scale-[1.03]"
                  }`}
                >

                  <div className="w-32 h-32 rounded-full bg-red-400/10 border border-red-400/30 flex flex-col items-center justify-center shadow-[0_0_45px_rgba(239,68,68,0.12)]">

                    <ShieldAlert
                      size={38}
                      className="text-red-400"
                    />

                    <span className="text-lg font-bold text-red-400 mt-2">
                      {sosActive ? "ACTIVE" : "SOS"}
                    </span>

                  </div>

                </button>

              </div>

            </div>

            <div className="text-center mt-6">

              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {sosActive
                  ? "Emergency signal transmitted"
                  : "Emergency assistance required?"}
              </h3>

              <p className="text-xs text-[#7185A7] mt-2 max-w-md mx-auto leading-5">
                {sosActive
                  ? "Your emergency request is currently being processed by the HawkVision response network."
                  : "Press the SOS button only for situations requiring immediate emergency response."}
              </p>

            </div>

            {/* Emergency Severity */}

            {!sosActive && (

              <div className="mt-8">

                <p className="text-xs font-medium text-[#8FA4C7] mb-3">
                  Emergency Priority
                </p>

                <div className="grid grid-cols-3 gap-3">

                  {["Critical", "High", "Medium"].map((level) => (

                    <button
                      key={level}
                      onClick={() => setSeverity(level)}
                      className={`py-3 rounded-xl border text-xs font-medium transition ${
                        severity === level
                          ? level === "Critical"
                            ? "bg-red-400/10 border-red-400/40 text-red-400"
                            : level === "High"
                            ? "bg-orange-400/10 border-orange-400/40 text-orange-400"
                            : "bg-amber-400/10 border-amber-400/40 text-amber-400"
                          : "bg-[#080D1A] border-[#1D304D] text-[#7185A7] hover:border-[#2A4261]"
                      }`}
                    >
                      {level}
                    </button>

                  ))}

                </div>

              </div>

            )}

            {/* Location */}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">

              <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1D304D]">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                    <MapPin
                      size={17}
                      className="text-emerald-400"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] text-[#617493]">
                      Current Location
                    </p>

                    <p className="text-xs font-medium text-[#D5E0F2] mt-1">
                      Lahore Emergency Zone
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1D304D]">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                    <Navigation
                      size={17}
                      className="text-blue-400"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] text-[#617493]">
                      GPS Status
                    </p>

                    <p className="text-xs font-medium text-emerald-400 mt-1">
                      Location Available
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= RIGHT STATUS PANEL ================= */}

        <div className="space-y-4">

          {/* Response Team */}

          <div className="bg-[#0D1628] border border-[#1D304D] rounded-2xl p-5">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-sm font-semibold text-[#F8FAFC]">
                  Response Network
                </h2>

                <p className="text-[10px] text-[#617493] mt-1">
                  Nearby emergency resources
                </p>
              </div>

              <Users
                size={18}
                className="text-blue-400"
              />

            </div>

            <div className="space-y-3">

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080D1A] border border-[#1D304D]">

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                    <Users
                      size={15}
                      className="text-emerald-400"
                    />
                  </div>

                  <span className="text-xs text-[#C8D5EA]">
                    Rescue Teams
                  </span>

                </div>

                <span className="text-xs font-semibold text-emerald-400">
                  08
                </span>

              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080D1A] border border-[#1D304D]">

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
                    <Navigation
                      size={15}
                      className="text-blue-400"
                    />
                  </div>

                  <span className="text-xs text-[#C8D5EA]">
                    Nearby Units
                  </span>

                </div>

                <span className="text-xs font-semibold text-blue-400">
                  14
                </span>

              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080D1A] border border-[#1D304D]">

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                    <Clock3
                      size={15}
                      className="text-amber-400"
                    />
                  </div>

                  <span className="text-xs text-[#C8D5EA]">
                    Avg Response
                  </span>

                </div>

                <span className="text-xs font-semibold text-amber-400">
                  06 min
                </span>

              </div>

            </div>

          </div>

          {/* Signal Status */}

          <div className="bg-[#0D1628] border border-[#1D304D] rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-4">

              <Activity
                size={17}
                className="text-emerald-400"
              />

              <h2 className="text-sm font-semibold text-[#F8FAFC]">
                Signal Status
              </h2>

            </div>

            <div className="space-y-4">

              <div>

                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-[#7185A7]">
                    Network Signal
                  </span>

                  <span className="text-[10px] text-emerald-400">
                    Strong
                  </span>
                </div>

                <div className="h-1.5 bg-[#16233A] rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-emerald-400 rounded-full" />
                </div>

              </div>

              <div>

                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-[#7185A7]">
                    GPS Accuracy
                  </span>

                  <span className="text-[10px] text-blue-400">
                    96%
                  </span>
                </div>

                <div className="h-1.5 bg-[#16233A] rounded-full overflow-hidden">
                  <div className="h-full w-[96%] bg-blue-400 rounded-full" />
                </div>

              </div>

            </div>

          </div>

          {/* Emergency Contact */}

          <div className="bg-[#0D1628] border border-red-400/20 rounded-2xl p-5">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                <Phone
                  size={18}
                  className="text-red-400"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#F8FAFC]">
                  Emergency Control
                </p>

                <p className="text-[10px] text-[#7185A7] mt-1">
                  Response center available 24/7
                </p>
              </div>

            </div>

            <button className="w-full mt-4 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-medium hover:bg-red-400 hover:text-white transition">
              Contact Response Center
            </button>

          </div>

        </div>

      </div>

      {/* ================= CONFIRMATION MODAL ================= */}

      {showConfirm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">

          <div className="w-full max-w-md bg-[#0D1628] border border-red-400/30 rounded-2xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b border-[#1D304D] flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                  <AlertTriangle
                    size={19}
                    className="text-red-400"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">
                    Activate Emergency SOS?
                  </h2>

                  <p className="text-[10px] text-[#617493] mt-1">
                    This will notify the response network.
                  </p>
                </div>

              </div>

              <button
                onClick={() => setShowConfirm(false)}
                className="text-[#617493] hover:text-white transition"
              >
                <X size={18} />
              </button>

            </div>

            <div className="p-5">

              <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/20">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-[#7185A7]">
                    Emergency Priority
                  </span>

                  <span className="text-xs font-semibold text-red-400">
                    {severity}
                  </span>

                </div>

                <div className="flex items-center justify-between mt-3">

                  <span className="text-xs text-[#7185A7]">
                    Location
                  </span>

                  <span className="text-xs text-[#D5E0F2]">
                    Lahore Emergency Zone
                  </span>

                </div>

              </div>

              <p className="text-xs text-[#8FA4C7] mt-4 leading-5">
                Only activate SOS when immediate emergency assistance is required. The system will transmit your emergency status to the response network.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">

                <button
                  onClick={() => setShowConfirm(false)}
                  className="py-3 rounded-xl bg-[#16233A] border border-[#1D304D] text-xs text-[#8FA4C7] hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  onClick={activateSOS}
                  className="py-3 rounded-xl bg-red-400 text-white text-xs font-semibold hover:bg-red-500 transition"
                >
                  Activate SOS
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default SOS;