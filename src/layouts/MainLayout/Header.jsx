import { useState } from "react";
import { Bell, CircleUserRound, Activity, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
   <header className="h-20 border-b border-[#1D304D] bg-[#080D1A] px-6 lg:px-8 flex items-center justify-between relative overflow-visible z-40">

      {/* Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#243A59] to-transparent" />

      {/* LEFT */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF3340] shadow-[0_0_8px_rgba(239,51,64,0.8)]" />
          <p className="text-[10px] tracking-[0.2em] text-[#EF3340] font-semibold">
            PAKISTAN · NATIONAL OPERATIONS
          </p>
        </div>

        <h2 className="text-lg font-semibold mt-1 text-[#F8FAFC] tracking-tight">
          Disaster Control Center
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* System */}
        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#0B1425] border border-[#1D304D]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
          </span>
          <span className="text-xs text-[#AFC1DC]">
            System Online
          </span>
        </div>

        {/* Response Network */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1D304D] bg-[#0B1425]">
          <Activity size={14} className="text-[#22C55E]" />
          <span className="text-[11px] text-[#7186A8]">
            Response Network
          </span>
          <span className="text-[11px] text-[#22C55E] font-semibold">
            Connected
          </span>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-[#1D304D]" />

        {/* Notification */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#8FA4C7] hover:text-[#F8FAFC] hover:bg-[#111C31] transition-all"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EF3340] rounded-full shadow-[0_0_6px_rgba(239,51,64,0.8)]" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 h-9 px-2 rounded-lg text-[#8FA4C7] hover:text-[#F8FAFC] hover:bg-[#111C31] transition-all"
          >
            <CircleUserRound size={21} />
            <span className="hidden sm:block text-sm max-w-[100px] truncate">
              {user?.fullName || 'User'}
            </span>
            <ChevronDown size={14} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[#1D304D] bg-[#0B1425] shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#1D304D]">
                <p className="text-sm font-medium text-[#F8FAFC] truncate">{user?.fullName}</p>
                <p className="text-xs text-[#8FA4C7] truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#EF3340] hover:bg-[#111C31] transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

