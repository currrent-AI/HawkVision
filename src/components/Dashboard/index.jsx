import { useEffect, useState } from "react";
import StatsCards from "./StatsCards";
import DisasterMap from "./DisasterMap";
import RecentAlerts from "./RecentAlerts";

const API_URL = "http://localhost:5000/api/disasters";

function Dashboard() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `Request failed with status ${response.status}`
          );
        }

        const result = await response.json();

        setDisasters(result.data || []);
      } catch (err) {
        setError(
          err.message ||
            "Unable to connect to the HawkVision backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
  }, []);

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex items-end justify-between gap-4">
  <div>
    <div className="flex items-center gap-2 mb-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[#EF3340] animate-pulse" />

      <p className="text-[11px] text-[#EF3340] tracking-[0.18em] font-semibold">
        REAL-TIME MONITORING
      </p>
    </div>

    <h1 className="text-3xl font-bold text-[#F8FAFC] tracking-tight">
      AI Disaster Control Center
    </h1>

    <p className="text-sm text-[#8FA4C7] mt-2">
      Monitor disasters, detect victims and coordinate emergency response.
    </p>
  </div>

  <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1D304D] bg-[#0C1527]">
    <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
    <span className="text-xs text-[#AFC1DC]">
      Response Network
    </span>
    <span className="text-xs text-[#22C55E] font-medium">
      Operational
    </span>
  </div>
</div>
        <div className="xl:col-span-2">
          <DisasterMap
            disasters={disasters}
            loading={loading}
            error={error}
          />
        </div>

        <div>
          <RecentAlerts
            disasters={disasters}
            loading={loading}
            error={error}
          />
        </div>

      </div>


  );
}

export default Dashboard;
