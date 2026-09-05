import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
  Activity,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_URL =
  `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/alerts`;

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [severityFilter, setSeverityFilter] =
    useState("ALL");

  // Default view = Open Alerts
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [processingId, setProcessingId] =
    useState(null);

  // =====================================================
  // FETCH ALERTS
  // =====================================================

  const fetchAlerts = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(API_URL);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              result.message ||
              "Failed to fetch alerts"
          );
        }

        setAlerts(result.data || []);
      } catch (err) {
        console.error(
          "Alerts fetch error:",
          err
        );

        setError(
          err.message ||
            "Unable to load alerts."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // =====================================================
  // INITIAL LOAD + AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(() => {
      fetchAlerts(true);
    }, 10000);

    return () =>
      clearInterval(interval);
  }, [fetchAlerts]);

  // =====================================================
  // UPDATE ALERT STATUS
  // =====================================================

  const updateAlertStatus = async (
    id,
    action
  ) => {
    try {
      setProcessingId(id);
      setError("");

      const response = await fetch(
        `${API_URL}/${id}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            result.message ||
            `Failed to ${action} alert`
        );
      }

      // Immediately update UI
      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) =>
          alert.id === id
            ? {
                ...alert,
                status:
                  action ===
                  "acknowledge"
                    ? "ACKNOWLEDGED"
                    : "RESOLVED",
              }
            : alert
        )
      );
    } catch (err) {
      console.error(
        `Alert ${action} error:`,
        err
      );

      setError(
        err.message ||
          `Unable to ${action} alert.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // NORMALIZE DATA
  // =====================================================

  const normalizedAlerts = useMemo(() => {
    return alerts.map((alert) => ({
      ...alert,

      severity: String(
        alert.severity || "LOW"
      ).toUpperCase(),

      status: String(
        alert.status || "ACTIVE"
      ).toUpperCase(),

      location:
        typeof alert.location ===
        "string"
          ? alert.location
          : alert.location?.name ||
            "Unknown",

      source:
        alert.source || "System",

      title:
        alert.title ||
        "Emergency Alert",

      description:
        alert.message ||
        alert.description ||
        "No additional information available.",

      // Managed alerts can be acknowledged/resolved
      isManaged:
        alert.isManaged === true,
    }));
  }, [alerts]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredAlerts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return normalizedAlerts.filter(
      (alert) => {
        const matchesSearch =
          !query ||
          alert.title
            .toLowerCase()
            .includes(query) ||
          alert.description
            .toLowerCase()
            .includes(query) ||
          alert.location
            .toLowerCase()
            .includes(query) ||
          alert.type
            ?.toLowerCase()
            .includes(query);

        const matchesSeverity =
          severityFilter === "ALL" ||
          alert.severity ===
            severityFilter;

        /*
         * ALL = Open Alerts
         *
         * Resolved alerts are hidden from the
         * default/open view.
         *
         * To see resolved history, select
         * "Resolved" from the status dropdown.
         */
        const matchesStatus =
          statusFilter === "ALL"
            ? alert.status !== "RESOLVED"
            : alert.status ===
              statusFilter;

        return (
          matchesSearch &&
          matchesSeverity &&
          matchesStatus
        );
      }
    );
  }, [
    normalizedAlerts,
    search,
    severityFilter,
    statusFilter,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = useMemo(() => {
    return {
      total: normalizedAlerts.length,

      active:
        normalizedAlerts.filter(
          (a) =>
            a.status === "ACTIVE"
        ).length,

      critical:
        normalizedAlerts.filter(
          (a) =>
            a.severity === "CRITICAL"
        ).length,

      high:
        normalizedAlerts.filter(
          (a) =>
            a.severity === "HIGH"
        ).length,
    };
  }, [normalizedAlerts]);

  // =====================================================
  // HELPERS
  // =====================================================

  const getSeverityColor = (
    severity
  ) => {
    switch (severity) {
      case "CRITICAL":
        return "#EF3340";

      case "HIGH":
        return "#F59E0B";

      case "MEDIUM":
        return "#3B82F6";

      case "LOW":
        return "#22C55E";

      default:
        return "#64748B";
    }
  };

  const getStatusStyle = (
    status
  ) => {
    if (status === "ACTIVE") {
      return "bg-[#EF3340]/10 text-[#EF3340] border-[#EF3340]/20";
    }

    if (
      status === "ACKNOWLEDGED"
    ) {
      return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
    }

    return "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20";
  };

  const formatTime = (date) => {
    if (!date) {
      return "Unknown time";
    }

    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "Unknown time";
    }

    return parsed.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getSourceLabel = (
    source
  ) => {
    const value =
      source?.toLowerCase() || "";

    if (value.includes("groq")) {
      return "AI Intelligence";
    }

    if (value.includes("flood")) {
      return "Flood Prediction";
    }

    if (value.includes("sos")) {
      return "SOS System";
    }

    if (
      value.includes("disaster")
    ) {
      return "Disaster System";
    }

    return source || "System";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">

            <p className="text-xs font-semibold tracking-wider text-[#3B82F6]">
              NATIONAL ALERT NETWORK
            </p>

            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              LIVE
            </span>

          </div>

          <h1 className="text-3xl font-bold text-[#F1F5F9] mt-2">
            Alerts
          </h1>

          <p className="text-sm text-[#8FA4C7] mt-2">
            Monitor and manage active
            disaster-response alerts.
          </p>
        </div>

        <button
          onClick={() =>
            fetchAlerts(true)
          }
          disabled={refreshing}
          className="h-10 px-4 rounded-xl bg-[#111C31] border border-[#1D304D] hover:border-[#3B82F6]/50 text-sm text-[#8FA4C7] hover:text-[#F1F5F9] transition flex items-center justify-center gap-2"
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        {/* TOTAL */}

        <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
              <Bell
                size={18}
                className="text-[#3B82F6]"
              />
            </div>

            <span className="text-xs text-[#64748B]">
              TOTAL
            </span>

          </div>

          <p className="text-2xl font-bold text-[#F1F5F9] mt-4">
            {stats.total}
          </p>

          <p className="text-xs text-[#64748B] mt-1">
            All alerts
          </p>

        </div>

        {/* ACTIVE */}

        <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div className="w-9 h-9 rounded-xl bg-[#EF3340]/10 flex items-center justify-center">
              <Activity
                size={18}
                className="text-[#EF3340]"
              />
            </div>

            <span className="text-xs text-[#64748B]">
              ACTIVE
            </span>

          </div>

          <p className="text-2xl font-bold text-[#F1F5F9] mt-4">
            {stats.active}
          </p>

          <p className="text-xs text-[#64748B] mt-1">
            Require attention
          </p>

        </div>

        {/* CRITICAL */}

        <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div className="w-9 h-9 rounded-xl bg-[#EF3340]/10 flex items-center justify-center">
              <ShieldAlert
                size={18}
                className="text-[#EF3340]"
              />
            </div>

            <span className="text-xs text-[#64748B]">
              CRITICAL
            </span>

          </div>

          <p className="text-2xl font-bold text-[#EF3340] mt-4">
            {stats.critical}
          </p>

          <p className="text-xs text-[#64748B] mt-1">
            Immediate response
          </p>

        </div>

        {/* HIGH */}

        <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
              <AlertTriangle
                size={18}
                className="text-[#F59E0B]"
              />
            </div>

            <span className="text-xs text-[#64748B]">
              HIGH
            </span>

          </div>

          <p className="text-2xl font-bold text-[#F59E0B] mt-4">
            {stats.high}
          </p>

          <p className="text-xs text-[#64748B] mt-1">
            Elevated risk
          </p>

        </div>

      </div>

      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}

      <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={17}
              className="absolute left-3 top-3 text-[#64748B]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search alerts..."
              className="w-full h-11 rounded-xl bg-[#080F1E] border border-[#1D304D] pl-10 pr-4 text-sm text-[#F1F5F9] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
            />

          </div>

          {/* SEVERITY */}

          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl bg-[#080F1E] border border-[#1D304D] px-4 text-sm text-[#F1F5F9] outline-none focus:border-[#3B82F6]"
          >

            <option value="ALL">
              All Severities
            </option>

            <option value="CRITICAL">
              Critical
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>

          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl bg-[#080F1E] border border-[#1D304D] px-4 text-sm text-[#F1F5F9] outline-none focus:border-[#3B82F6]"
          >

            <option value="ALL">
              Open Alerts
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="ACKNOWLEDGED">
              Acknowledged
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

          </select>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="p-4 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/20 flex items-start gap-3">

          <XCircle
            size={19}
            className="text-[#EF3340] mt-0.5 shrink-0"
          />

          <div>

            <p className="text-sm font-medium text-[#F1F5F9]">
              Alert service unavailable
            </p>

            <p className="text-xs text-[#8FA4C7] mt-1">
              {error}
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-12 flex flex-col items-center justify-center">

          <RefreshCw
            size={28}
            className="text-[#3B82F6] animate-spin"
          />

          <p className="text-sm text-[#8FA4C7] mt-4">
            Loading emergency alerts...
          </p>

        </div>

      ) : filteredAlerts.length === 0 ? (

        <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-12 flex flex-col items-center justify-center text-center">

          <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center">

            <Bell
              size={26}
              className="text-[#3B82F6]"
            />

          </div>

          <p className="text-sm font-semibold text-[#F1F5F9] mt-4">
            No alerts found
          </p>

          <p className="text-xs text-[#64748B] mt-2">
            No alerts match the
            selected filters.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {filteredAlerts.map(
            (alert) => {

              const severityColor =
                getSeverityColor(
                  alert.severity
                );

              const isProcessing =
                processingId ===
                alert.id;

              return (

                <div
                  key={alert.id}
                  className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-5 hover:border-[#2B4568] transition"
                >

                  {/* =====================================================
                      TOP
                  ===================================================== */}

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                    <div className="flex gap-4">

                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor:
                            `${severityColor}18`,
                        }}
                      >

                        <AlertTriangle
                          size={21}
                          style={{
                            color:
                              severityColor,
                          }}
                        />

                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-base font-semibold text-[#F1F5F9]">
                            {alert.title}
                          </h2>

                          <span
                            className="px-2 py-1 rounded-full text-[9px] font-bold border"
                            style={{
                              color:
                                severityColor,

                              backgroundColor:
                                `${severityColor}12`,

                              borderColor:
                                `${severityColor}30`,
                            }}
                          >
                            {alert.severity}
                          </span>

                        </div>

                        <p className="text-xs text-[#64748B] mt-1">
                          {alert.type}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`w-fit px-3 py-1.5 rounded-full border text-[10px] font-bold ${getStatusStyle(
                        alert.status
                      )}`}
                    >
                      {alert.status}
                    </span>

                  </div>

                  {/* =====================================================
                      DESCRIPTION
                  ===================================================== */}

                  <div className="mt-4 ml-0 lg:ml-15">

                    <p className="text-sm text-[#8FA4C7] leading-relaxed">
                      {alert.description}
                    </p>

                  </div>

                  {/* =====================================================
                      META + ACTIONS
                  ===================================================== */}

                  <div className="mt-5 pt-4 border-t border-[#1D304D] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                    <div className="flex flex-wrap gap-x-5 gap-y-2">

                      {/* LOCATION */}

                      <div className="flex items-center gap-2 text-xs text-[#64748B]">

                        <MapPin
                          size={14}
                          className="text-[#3B82F6]"
                        />

                        <span>
                          {alert.location}
                        </span>

                      </div>

                      {/* TIME */}

                      <div className="flex items-center gap-2 text-xs text-[#64748B]">

                        <Clock3
                          size={14}
                        />

                        <span>
                          {formatTime(
                            alert.createdAt
                          )}
                        </span>

                      </div>

                      {/* SOURCE */}

                      <div className="flex items-center gap-2 text-xs text-[#64748B]">

                        <Activity
                          size={14}
                          className="text-[#8FA4C7]"
                        />

                        <span>
                          {getSourceLabel(
                            alert.source
                          )}
                        </span>

                      </div>

                    </div>

                    {/* =====================================================
                        ACTIONS
                    ===================================================== */}

                    <div className="flex items-center gap-2">

                      {/* ACKNOWLEDGE */}

                      {alert.isManaged &&
                        alert.status ===
                          "ACTIVE" && (

                          <button
                            disabled={
                              isProcessing
                            }
                            onClick={() =>
                              updateAlertStatus(
                                alert.id,
                                "acknowledge"
                              )
                            }
                            className="h-9 px-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/20 disabled:opacity-50 text-xs font-semibold transition flex items-center gap-2"
                          >

                            {isProcessing ? (

                              <RefreshCw
                                size={13}
                                className="animate-spin"
                              />

                            ) : (

                              <CheckCircle2
                                size={13}
                              />

                            )}

                            Acknowledge

                          </button>

                        )}

                      {/* RESOLVE */}

                      {alert.isManaged &&
                        alert.status !==
                          "RESOLVED" && (

                          <button
                            disabled={
                              isProcessing
                            }
                            onClick={() =>
                              updateAlertStatus(
                                alert.id,
                                "resolve"
                              )
                            }
                            className="h-9 px-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/20 disabled:opacity-50 text-xs font-semibold transition flex items-center gap-2"
                          >

                            {isProcessing ? (

                              <RefreshCw
                                size={13}
                                className="animate-spin"
                              />

                            ) : (

                              <CheckCircle2
                                size={13}
                              />

                            )}

                            Resolve

                          </button>

                        )}

                    </div>

                  </div>

                </div>

              );
            }
          )}

        </div>

      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      {!loading &&
        filteredAlerts.length > 0 && (

          <div className="flex items-center justify-between text-[11px] text-[#64748B]">

            <span>
              Showing{" "}

              <span className="text-[#8FA4C7]">
                {
                  filteredAlerts.length
                }
              </span>

              {" "}of{" "}

              <span className="text-[#8FA4C7]">
                {
                  normalizedAlerts.length
                }
              </span>

              {" "}alerts
            </span>

            <span className="flex items-center gap-1.5">

              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />

              Auto-refreshing

            </span>

          </div>

        )}

    </div>
  );
}

export default Alerts;