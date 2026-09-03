import {
  AlertTriangle,
  MapPin,
  Clock3,
  ChevronRight,
} from "lucide-react";

const severityColors = {
  Critical: "#EF3340",
  High: "#F59E0B",
  Medium: "#3B82F6",
  Low: "#22C55E",
};

const getSeverityColor = (severity) =>
  severityColors[severity] || "#3B82F6";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "unknown";

  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? "s" : ""} ago`;
};

function RecentAlerts({ disasters = [], loading = false, error = null }) {

  const alerts = disasters.map((disaster) => ({
    id: disaster._id,
    title: disaster.description || `${disaster.type} Incident`,
    location: disaster.location,
    time: formatTimeAgo(disaster.createdAt),
    type: (disaster.severity || "").toUpperCase(),
    status: disaster.status,
    color: getSeverityColor(disaster.severity),
  }));

  const activeCount = alerts.filter(
    (alert) => alert.status === "Active"
  ).length;

  return (
    <div className="relative h-full overflow-hidden bg-gradient-to-br from-[#111C31] to-[#0D1729] border border-[#1D304D] rounded-2xl p-6">

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#304968] to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/20 flex items-center justify-center">
            <AlertTriangle
              size={20}
              className="text-[#EF3340]"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#F1F5F9]">
              Recent Alerts
            </h2>

            <p className="text-xs text-[#7186A8] mt-1">
              Latest emergency events
            </p>
          </div>

        </div>

        {/* Active count */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">

          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />

          <span className="text-[9px] font-semibold text-[#22C55E] tracking-wide">
            {activeCount} ACTIVE
          </span>

        </div>

      </div>

      {/* Alert List */}
      <div className="space-y-3">

        {loading ? (

          <div className="py-10 flex flex-col items-center justify-center text-center">

            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />

            <p className="text-sm text-[#8FA4C7] mt-3">
              Loading alerts...
            </p>

          </div>

        ) : error ? (

          <div className="py-10 flex flex-col items-center justify-center text-center">

            <span className="w-2 h-2 rounded-full bg-[#EF3340] shadow-[0_0_8px_rgba(239,51,64,0.8)]" />

            <p className="text-sm font-semibold text-[#EF3340] mt-3">
              Failed to load alerts
            </p>

            <p className="text-xs text-[#64748B] mt-2 max-w-[220px]">
              {error}
            </p>

          </div>

        ) : alerts.length === 0 ? (

          <div className="py-10 flex flex-col items-center justify-center text-center">

            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />

            <p className="text-sm text-[#8FA4C7] mt-3">
              No recent alerts
            </p>

            <p className="text-xs text-[#64748B] mt-2 max-w-[220px]">
              Disaster alerts will appear here once detected.
            </p>

          </div>

        ) : (

          alerts.map((alert) => (

            <div
              key={alert.id}
              className="
                group relative
                p-4
                rounded-xl
                bg-[#0A1324]
                border border-[#1A2D49]
                hover:border-[#304968]
                hover:bg-[#0D172A]
                transition-all duration-200
                cursor-pointer
              "
            >

              {/* Severity accent */}
              <div
                className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                style={{
                  backgroundColor: alert.color,
                  boxShadow: `0 0 8px ${alert.color}66`,
                }}
              />

              <div className="flex items-start justify-between gap-3">

                {/* Main information */}
                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: alert.color,
                        boxShadow: `0 0 8px ${alert.color}`,
                      }}
                    />

                    <p className="text-sm font-semibold text-[#E8EEF7] truncate">
                      {alert.title}
                    </p>

                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 mt-2.5">

                    <MapPin
                      size={12}
                      className="text-[#64748B]"
                    />

                    <span className="text-xs text-[#8FA4C7]">
                      {alert.location}
                    </span>

                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 mt-1.5">

                    <Clock3
                      size={11}
                      className="text-[#64748B]"
                    />

                    <span className="text-[10px] text-[#64748B]">
                      Detected {alert.time}
                    </span>

                    <span className="text-[10px] text-[#475569]">
                      ·
                    </span>

                    <span className="text-[10px] text-[#8FA4C7]">
                      {alert.status}
                    </span>

                  </div>

                </div>

                {/* Severity */}
                <span
                  className="shrink-0 text-[8px] font-bold tracking-wider px-2 py-1 rounded-md"
                  style={{
                    color: alert.color,
                    backgroundColor: `${alert.color}12`,
                    border: `1px solid ${alert.color}30`,
                  }}
                >
                  {alert.type}
                </span>

              </div>

              {/* Hover action */}
              <div className="flex justify-end mt-2">

                <ChevronRight
                  size={14}
                  className="
                    text-[#415775]
                    group-hover:text-[#8FA4C7]
                    group-hover:translate-x-0.5
                    transition-all
                  "
                />

              </div>

            </div>

          ))

        )}

      </div>

      {/* Footer */}
      <button
        className="
          w-full
          mt-5
          py-3
          rounded-xl
          border border-[#1D304D]
          bg-[#0B1425]
          text-xs
          font-medium
          text-[#8FA4C7]
          hover:text-[#F8FAFC]
          hover:border-[#304968]
          hover:bg-[#101B2E]
          transition-all
        "
      >
        View All Alerts
      </button>

    </div>
  );
}

export default RecentAlerts;
