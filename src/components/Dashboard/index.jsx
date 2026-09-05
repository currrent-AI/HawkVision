import { useEffect, useState } from "react";
import StatsCards from "./StatsCards";
import DisasterMap from "./DisasterMap";
import RecentAlerts from "./RecentAlerts";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const DISASTERS_API_URL =
  `${API_BASE_URL}/api/disasters`;

const ALERTS_API_URL =
  `${API_BASE_URL}/api/alerts`;

function Dashboard() {
  const [disasters, setDisasters] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        disastersResponse,
        alertsResponse,
      ] = await Promise.all([
        fetch(DISASTERS_API_URL),
        fetch(ALERTS_API_URL),
      ]);

      if (!disastersResponse.ok) {
        throw new Error(
          `Disasters request failed with status ${disastersResponse.status}`
        );
      }

      if (!alertsResponse.ok) {
        throw new Error(
          `Alerts request failed with status ${alertsResponse.status}`
        );
      }

      const disastersResult =
        await disastersResponse.json();

      const alertsResult =
        await alertsResponse.json();

      setDisasters(
        Array.isArray(
          disastersResult?.data
        )
          ? disastersResult.data
          : []
      );

      setAlerts(
        Array.isArray(
          alertsResult?.data
        )
          ? alertsResult.data
          : []
      );
    } catch (err) {
      console.error(
        "Dashboard data fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to the HawkVision backend."
      );

      setDisasters([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAlertDeleted = (deletedId) => {
    setAlerts((currentAlerts) =>
      currentAlerts.filter(
        (alert) =>
          alert.id !== deletedId
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADING
      ===================================================== */}

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="
                w-1.5
                h-1.5
                rounded-full
                bg-[#EF3340]
                animate-pulse
              "
            />

            <p
              className="
                text-[11px]
                text-[#EF3340]
                tracking-[0.18em]
                font-semibold
              "
            >
              REAL-TIME MONITORING
            </p>
          </div>

          <h1
            className="
              text-3xl
              font-bold
              text-[#F8FAFC]
              tracking-tight
            "
          >
            AI Disaster Control Center
          </h1>

          <p className="text-sm text-[#8FA4C7] mt-2">
            Monitor disasters, detect victims and
            coordinate emergency response.
          </p>
        </div>

        <div
          className="
            hidden
            md:flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            border
            border-[#1D304D]
            bg-[#0C1527]
          "
        >
          <span
            className="
              w-2
              h-2
              rounded-full
              bg-[#22C55E]
              shadow-[0_0_8px_rgba(34,197,94,0.8)]
            "
          />

          <span className="text-xs text-[#AFC1DC]">
            Response Network
          </span>

          <span className="text-xs text-[#22C55E] font-medium">
            Operational
          </span>
        </div>
      </div>

      {/* =====================================================
          OPTIONAL STATS
          Uncomment if you want StatsCards visible.
      ===================================================== */}

      {/* <StatsCards /> */}

      {/* =====================================================
          DISASTER MAP
      ===================================================== */}

      <div>
        <DisasterMap
          disasters={disasters}
          loading={loading}
          error={error}
        />
      </div>

      {/* =====================================================
          RECENT ALERTS
      ===================================================== */}

      <div>
        <RecentAlerts
          alerts={alerts}
          loading={loading}
          error={error}
          onAlertDeleted={
            handleAlertDeleted
          }
        />
      </div>
    </div>
  );
}

export default Dashboard;