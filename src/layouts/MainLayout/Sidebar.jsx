import {
  LayoutDashboard,
  Users,
  Waves,
  MapPin,
  MessageSquare,
  Bell,
  ShieldAlert,
  Phone,
  Video,
} from "lucide-react";

import hawkvision1 from "../../assets/hawkvision1.svg";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Victim Detection",
      icon: Users,
      path: "/victim-detection",
    },
    {
      name: "Drone Surveillance",
      icon: Video,
      path: "/drone-surveillance",
    },
    {
      name: "Flood Prediction",
      icon: Waves,
      path: "/flood-prediction",
    },
    {
      name: "Shelter Finder",
      icon: MapPin,
      path: "/shelter-finder",
    },
    {
      name: "Emergency Chatbot",
      icon: MessageSquare,
      path: "/emergency-chatbot",
    },
    {
      name: "Alerts",
      icon: Bell,
      path: "/alerts",
    },
    {
      name: "SOS",
      icon: ShieldAlert,
      path: "/sos",
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#080D1A] border-r border-[#1D304D] px-4 py-5 flex flex-col">
      {/* ================= LOGO ================= */}

      <div className="mb-7">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center justify-center cursor-pointer"
          aria-label="Go to Dashboard"
          title="HawkVision Dashboard"
        >
          <img
            src={hawkvision1}
            alt="HawkVision AI"
            className="w-full max-w-[220px] h-auto object-contain"
          />
        </button>

        <div className="flex items-center gap-2 mt-2 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF3340] shadow-[0_0_7px_rgba(239,51,64,0.7)]" />

          <p className="text-xs text-[#8FA4C7] tracking-wide">
            National Operations
          </p>
        </div>
      </div>

      {/* ================= NAVIGATION ================= */}

      <nav className="space-y-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                group
                relative
                w-full
                flex
                items-center
                gap-3
                px-3
                py-2.5
                rounded-lg
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-[#EF3340]/15 text-[#EF3340]"
                    : "text-[#8FA4C7] hover:bg-[#101B2E] hover:text-[#F8FAFC]"
                }
              `}
            >
              {/* Active red line */}
              {isActive && (
                <span
                  className="
                    absolute
                    left-0
                    top-1/2
                    -translate-y-1/2
                    w-0.5
                    h-6
                    rounded-full
                    bg-[#EF3340]
                    shadow-[0_0_8px_rgba(239,51,64,0.8)]
                  "
                />
              )}

              <Icon
                size={18}
                strokeWidth={isActive ? 2.2 : 2}
                className={`
                  transition-colors
                  ${
                    isActive
                      ? "text-[#EF3340]"
                      : "text-[#8FA4C7] group-hover:text-[#F8FAFC]"
                  }
                `}
              />

              <span className="text-sm font-medium">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ================= EMERGENCY HOTLINE ================= */}

      <div className="mt-6">
        <a
          href="tel:1122"
          className="
            relative
            block
            overflow-hidden
            rounded-xl
            border
            border-[#EF3340]/30
            bg-[#100D19]
            px-3.5
            py-3.5
            hover:border-[#EF3340]/60
            hover:bg-[#160F1C]
            transition-all
            cursor-pointer
          "
          aria-label="Call Emergency Hotline 1122"
          title="Call Emergency Hotline 1122"
        >
          {/* Subtle red glow */}
          <div
            className="
              absolute
              -right-8
              -bottom-8
              w-20
              h-20
              rounded-full
              bg-[#EF3340]/10
              blur-2xl
            "
          />

          {/* Label */}
          <p className="relative text-[10px] font-semibold tracking-wide text-[#EF3340] uppercase">
            Emergency Hotline
          </p>

          {/* Number */}
          <div className="relative flex items-center gap-2 mt-2">
            <Phone
              size={19}
              className="text-[#EF3340]"
            />

            <span className="text-xl font-bold text-[#F8FAFC] tracking-wide">
              1122
            </span>
          </div>

          {/* Description */}
          <p className="relative text-[9px] text-[#8FA4C7] mt-1">
            National Emergency Number
          </p>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;