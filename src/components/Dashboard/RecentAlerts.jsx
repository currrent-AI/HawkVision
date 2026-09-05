import { useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Clock3,
  ChevronRight,
  X,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const severityColors = {
  CRITICAL: "#EF3340",
  HIGH: "#F59E0B",
  MEDIUM: "#3B82F6",
  LOW: "#22C55E",

  Critical: "#EF3340",
  High: "#F59E0B",
  Medium: "#3B82F6",
  Low: "#22C55E",
};

const getSeverityColor = (severity) =>
  severityColors[String(severity || "").toUpperCase()] ||
  "#3B82F6";

const normalizeStatus = (status) =>
  String(status || "").toUpperCase();

const formatTimeAgo = (dateString) => {
  if (!dateString) return "unknown";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  const seconds = Math.floor(
    (Date.now() - date.getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? "s" : ""} ago`;
};

function RecentAlerts({
  alerts = [],
  loading = false,
  error = null,
  onAlertDeleted,
}) {
  const [selectedAlert, setSelectedAlert] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  // Recent Alerts should only show unresolved incidents.
  // RESOLVED alerts remain available on the Alerts page/history,
  // but they are removed from this dashboard's "Recent Alerts" view.
  const normalizedAlerts = Array.isArray(alerts)
    ? alerts.filter(
        (alert) =>
          normalizeStatus(alert.status) !== "RESOLVED"
      )
    : [];

  const activeCount = normalizedAlerts.filter(
    (alert) =>
      normalizeStatus(alert.status) === "ACTIVE"
  ).length;

  const handleDelete = async (alert) => {
    if (!alert?.id || !alert?.isManaged) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${alert.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:5000";

      const response = await fetch(
        `${API_BASE_URL}/api/alerts/${alert.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete alert"
        );
      }

      setSelectedAlert(null);

      if (onAlertDeleted) {
        onAlertDeleted(alert.id);
      }
    } catch (err) {
      console.error(
        "Delete alert error:",
        err
      );

      window.alert(
        err.message ||
          "Unable to delete alert."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className="
          relative
          h-full
          overflow-hidden
          bg-gradient-to-br
          from-[#111C31]
          to-[#0D1729]
          border
          border-[#1D304D]
          rounded-2xl
          p-6
        "
      >
        {/* Top accent */}
        <div
          className="
            absolute
            top-0
            left-0
            right-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-[#304968]
            to-transparent
          "
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-[#EF3340]/10
                border
                border-[#EF3340]/20
                flex
                items-center
                justify-center
              "
            >
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
          <div
            className="
              flex
              items-center
              gap-1.5
              px-2.5
              py-1.5
              rounded-full
              bg-[#22C55E]/10
              border
              border-[#22C55E]/20
            "
          >
            <span
              className="
                w-1.5
                h-1.5
                rounded-full
                bg-[#22C55E]
                animate-pulse
              "
            />

            <span
              className="
                text-[9px]
                font-semibold
                text-[#22C55E]
                tracking-wide
              "
            >
              {activeCount} ACTIVE
            </span>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <span
                className="
                  w-2
                  h-2
                  rounded-full
                  bg-[#22C55E]
                  animate-pulse
                  shadow-[0_0_8px_rgba(34,197,94,0.8)]
                "
              />

              <p className="text-sm text-[#8FA4C7] mt-3">
                Loading alerts...
              </p>
            </div>
          ) : error ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <span
                className="
                  w-2
                  h-2
                  rounded-full
                  bg-[#EF3340]
                  shadow-[0_0_8px_rgba(239,51,64,0.8)]
                "
              />

              <p className="text-sm font-semibold text-[#EF3340] mt-3">
                Failed to load alerts
              </p>

              <p className="text-xs text-[#64748B] mt-2 max-w-[220px]">
                {error}
              </p>
            </div>
          ) : normalizedAlerts.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <CheckCircle2
                size={22}
                className="text-[#22C55E]"
              />

              <p className="text-sm text-[#8FA4C7] mt-3">
                No recent alerts
              </p>

              <p className="text-xs text-[#64748B] mt-2 max-w-[220px]">
                Disaster alerts will appear here once
                detected.
              </p>
            </div>
          ) : (
            normalizedAlerts.map((alert) => {
              const severity =
                String(
                  alert.severity || "MEDIUM"
                ).toUpperCase();

              const color =
                getSeverityColor(severity);

              const status =
                normalizeStatus(
                  alert.status
                );

              return (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() =>
                    setSelectedAlert(alert)
                  }
                  className="
                    group
                    relative
                    w-full
                    text-left
                    p-4
                    rounded-xl
                    bg-[#0A1324]
                    border
                    border-[#1A2D49]
                    hover:border-[#304968]
                    hover:bg-[#0D172A]
                    transition-all
                    duration-200
                    cursor-pointer
                  "
                >
                  {/* Severity accent */}
                  <div
                    className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}66`,
                    }}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Title */}
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: color,
                            boxShadow: `0 0 8px ${color}`,
                          }}
                        />

                        <p className="text-sm font-semibold text-[#E8EEF7] truncate">
                          {alert.title ||
                            alert.message ||
                            "Emergency Alert"}
                        </p>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <MapPin
                          size={12}
                          className="text-[#64748B]"
                        />

                        <span className="text-xs text-[#8FA4C7] truncate">
                          {alert.location ||
                            "Location unavailable"}
                        </span>
                      </div>

                      {/* Time + Status */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock3
                          size={11}
                          className="text-[#64748B]"
                        />

                        <span className="text-[10px] text-[#64748B]">
                          Detected{" "}
                          {formatTimeAgo(
                            alert.createdAt
                          )}
                        </span>

                        <span className="text-[10px] text-[#475569]">
                          ·
                        </span>

                        <span
                          className="text-[10px] font-medium"
                          style={{
                            color:
                              status === "ACTIVE"
                                ? "#22C55E"
                                : "#8FA4C7",
                          }}
                        >
                          {status || "UNKNOWN"}
                        </span>
                      </div>
                    </div>

                    {/* Severity */}
                    <span
                      className="
                        shrink-0
                        text-[8px]
                        font-bold
                        tracking-wider
                        px-2
                        py-1
                        rounded-md
                      "
                      style={{
                        color,
                        backgroundColor: `${color}12`,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {severity}
                    </span>
                  </div>

                  {/* Arrow */}
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
                </button>
              );
            })
          )}
        </div>

        {/* View All */}
        <button
          type="button"
          onClick={() => {
            window.location.href = "/alerts";
          }}
          className="
            w-full
            mt-5
            py-3
            rounded-xl
            border
            border-[#1D304D]
            bg-[#0B1425]
            text-xs
            font-medium
            text-[#8FA4C7]
            hover:text-[#F8FAFC]
            hover:border-[#304968]
            hover:bg-[#101B2E]
            transition-all
            cursor-pointer
          "
        >
          View All Alerts
        </button>
      </div>

      {/* =====================================================
          ALERT DETAILS MODAL
      ===================================================== */}

      {selectedAlert && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() =>
            !deleting &&
            setSelectedAlert(null)
          }
        >
          <div
            className="
              w-full
              max-w-lg
              bg-[#0F192B]
              border
              border-[#263D5D]
              rounded-2xl
              shadow-[0_25px_80px_rgba(0,0,0,0.5)]
              overflow-hidden
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-[#1D304D]">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${getSeverityColor(
                      selectedAlert.severity
                    )}15`,
                    border: `1px solid ${getSeverityColor(
                      selectedAlert.severity
                    )}35`,
                  }}
                >
                  <AlertTriangle
                    size={19}
                    style={{
                      color:
                        getSeverityColor(
                          selectedAlert.severity
                        ),
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#F8FAFC]">
                    {selectedAlert.title ||
                      "Emergency Alert"}
                  </h3>

                  <p className="text-xs text-[#7186A8] mt-1">
                    {selectedAlert.type ||
                      "System Alert"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAlert(null)
                }
                disabled={deleting}
                className="
                  p-2
                  rounded-lg
                  text-[#7186A8]
                  hover:text-[#F8FAFC]
                  hover:bg-[#17253A]
                  transition
                "
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* Severity */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                  Severity
                </p>

                <span
                  className="inline-flex mt-1 text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-md"
                  style={{
                    color: getSeverityColor(
                      selectedAlert.severity
                    ),
                    backgroundColor: `${getSeverityColor(
                      selectedAlert.severity
                    )}12`,
                    border: `1px solid ${getSeverityColor(
                      selectedAlert.severity
                    )}30`,
                  }}
                >
                  {String(
                    selectedAlert.severity ||
                      "MEDIUM"
                  ).toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                  Description
                </p>

                <p className="text-sm text-[#C7D3E5] mt-1 leading-6">
                  {selectedAlert.message ||
                    selectedAlert.description ||
                    "No description available."}
                </p>
              </div>

              {/* Location */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                  Location
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <MapPin
                    size={14}
                    className="text-[#3B82F6]"
                  />

                  <span className="text-sm text-[#C7D3E5]">
                    {selectedAlert.location ||
                      "Location unavailable"}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0A1324] border border-[#1A2D49]">
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider">
                    Status
                  </p>

                  <p
                    className="text-xs font-semibold mt-1"
                    style={{
                      color:
                        normalizeStatus(
                          selectedAlert.status
                        ) === "ACTIVE"
                          ? "#22C55E"
                          : "#8FA4C7",
                    }}
                  >
                    {normalizeStatus(
                      selectedAlert.status
                    ) || "UNKNOWN"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0A1324] border border-[#1A2D49]">
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider">
                    Source
                  </p>

                  <p className="text-xs text-[#C7D3E5] mt-1">
                    {selectedAlert.source ||
                      "HawkVision AI"}
                  </p>
                </div>
              </div>

              {/* Coordinates */}
              {selectedAlert.latitude != null &&
                selectedAlert.longitude != null && (
                  <div className="p-3 rounded-xl bg-[#0A1324] border border-[#1A2D49]">
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider">
                      Coordinates
                    </p>

                    <p className="text-xs text-[#8FA4C7] mt-1">
                      {Number(
                        selectedAlert.latitude
                      ).toFixed(5)}
                      ,{" "}
                      {Number(
                        selectedAlert.longitude
                      ).toFixed(5)}
                    </p>
                  </div>
                )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between gap-3 p-5 border-t border-[#1D304D]">
              <button
                type="button"
                onClick={() =>
                  setSelectedAlert(null)
                }
                className="
                  px-4
                  py-2.5
                  rounded-lg
                  border
                  border-[#263D5D]
                  text-xs
                  text-[#8FA4C7]
                  hover:text-[#F8FAFC]
                  hover:bg-[#17253A]
                  transition
                "
              >
                Close
              </button>

              {selectedAlert.isManaged && (
                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedAlert
                    )
                  }
                  disabled={deleting}
                  className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-lg
                    bg-[#EF3340]/10
                    border
                    border-[#EF3340]/30
                    text-xs
                    font-medium
                    text-[#EF3340]
                    hover:bg-[#EF3340]/20
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  <Trash2 size={14} />

                  {deleting
                    ? "Deleting..."
                    : "Delete Alert"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RecentAlerts;