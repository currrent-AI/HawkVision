import {
  TriangleAlert,
  Users,
  Home,
  BellRing,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    title: "Active Disasters",
    value: "12",
    description: "+3 in last 24 hours",
    trend: "+33%",
    icon: TriangleAlert,
    iconColor: "text-[#EF3340]",
    iconBg: "bg-[#EF3340]/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(239,51,64,0.08)]",
  },
  {
    title: "Victims Detected",
    value: "1,284",
    description: "87 need urgent help",
    trend: "+12.4%",
    icon: Users,
    iconColor: "text-[#F59E0B]",
    iconBg: "bg-[#F59E0B]/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]",
  },
  {
    title: "Available Shelters",
    value: "48",
    description: "72% capacity available",
    trend: "Healthy",
    icon: Home,
    iconColor: "text-[#22C55E]",
    iconBg: "bg-[#22C55E]/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.08)]",
  },
  {
    title: "Active Alerts",
    value: "23",
    description: "5 high priority",
    trend: "+5 today",
    icon: BellRing,
    iconColor: "text-[#FBBF24]",
    iconBg: "bg-[#FBBF24]/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(251,191,36,0.08)]",
  },
];

function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className={`
              group relative overflow-hidden
              bg-gradient-to-br from-[#111C31] to-[#0C1527]
              border border-[#1D304D]
              rounded-2xl p-5
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-[#304968]
              ${stat.glow}
            `}
          >
            {/* Subtle top glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#29405F] to-transparent opacity-60" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#7186A8] font-medium">
                  {stat.title}
                </p>

                <div className="flex items-end gap-2 mt-2">
                  <h2 className="text-3xl font-bold text-[#F8FAFC] tracking-tight">
                    {stat.value}
                  </h2>

                  <span className="flex items-center gap-0.5 text-[10px] text-[#22C55E] mb-1">
                    <ArrowUpRight size={11} />
                    {stat.trend}
                  </span>
                </div>
              </div>

              <div
                className={`
                  p-3 rounded-xl
                  ${stat.iconBg}
                  border border-white/[0.03]
                  transition-transform duration-300
                  group-hover:scale-105
                `}
              >
                <Icon
                  size={20}
                  className={stat.iconColor}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1D304D]/60">
              <p className="text-[11px] text-[#7186A8]">
                {stat.description}
              </p>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-[#243A59] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;