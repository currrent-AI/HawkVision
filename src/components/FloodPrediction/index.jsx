import {
  Waves,
  MapPin,
  CloudRain,
  Gauge,
  AlertTriangle,
  TrendingUp,
  Thermometer,
  Droplets,
  Database,
  Sparkles,
  RefreshCw,
  Radio,
  Clock3,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

const LOCATIONS = [
  "Lahore",
  "Swat",
  "Islamabad",
  "Rawalpindi",
  "Murree",
  "Peshawar",
  "Karachi",
];

const EMPTY_ENVIRONMENT = {
  rainfall: null,
  waterLevel: null,
  temperature: null,
  humidity: null,
  weatherCondition: null,
  dataSource: null,
  weatherSource: null,
  waterLevelSource: null,
  rainfallPeriod: null,
  timestamp: null,
};

const EMPTY_PREDICTION = {
  risk: "",
  percentage: 0,
  recommendation: "",
};

function FloodPrediction() {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";

  const [location, setLocation] = useState("Lahore");

  const [environment, setEnvironment] = useState(
    EMPTY_ENVIRONMENT
  );

  const [prediction, setPrediction] = useState(
    EMPTY_PREDICTION
  );

  const [aiAlert, setAiAlert] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  /*
   * ---------------------------------------------------------
   * FETCH CURRENT FLOOD DATA
   * ---------------------------------------------------------
   *
   * The backend automatically gets:
   * - OpenWeather rainfall
   * - temperature
   * - humidity
   * - weather condition
   * - environmental water level
   * - calculated flood risk
   *
   * HIGH / CRITICAL events are handled by the
   * existing backend + Groq + MongoDB pipeline.
   */

  const fetchFloodData = useCallback(
    async (selectedLocation, isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `${API_BASE}/api/flood/predict`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              location: selectedLocation,
            }),
          }
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              result.message ||
              "Unable to load flood monitoring data."
          );
        }

        const data = result.data;

        setEnvironment({
          rainfall:
            data.rainfall ?? null,

          waterLevel:
            data.waterLevel ?? null,

          temperature:
            data.temperature ?? null,

          humidity:
            data.humidity ?? null,

          weatherCondition:
            data.weatherCondition ?? null,

          dataSource:
            data.dataSource ??
            data.source ??
            null,

          weatherSource:
            data.weatherSource ?? null,

          waterLevelSource:
            data.waterLevelSource ?? null,

          rainfallPeriod:
            data.rainfallPeriod ?? null,

          timestamp:
            data.timestamp ?? null,
        });

        setPrediction({
          risk: data.risk ?? "",
          percentage:
            data.percentage ?? 0,

          recommendation:
            data.recommendation ?? "",
        });

        setAiAlert(
          data.aiAlert || null
        );

        setLastUpdated(
          data.timestamp || new Date()
        );
      } catch (fetchError) {
        console.error(
          "Flood monitoring UI error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load flood monitoring data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_BASE]
  );

  /*
   * ---------------------------------------------------------
   * AUTOMATIC INITIAL LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    fetchFloodData(location);
  }, [location, fetchFloodData]);

  /*
   * ---------------------------------------------------------
   * AUTOMATIC 10-MINUTE REFRESH
   * ---------------------------------------------------------
   *
   * This only refreshes the selected location's display.
   *
   * The actual national monitoring + alert generation
   * is already running on the backend.
   */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFloodData(location);
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [location, fetchFloodData]);

  /*
   * ---------------------------------------------------------
   * RISK HELPERS
   * ---------------------------------------------------------
   */

  const getRiskColor = () => {
    if (prediction.risk === "LOW")
      return "#22C55E";

    if (prediction.risk === "MODERATE")
      return "#3B82F6";

    if (prediction.risk === "HIGH")
      return "#F59E0B";

    if (prediction.risk === "CRITICAL")
      return "#EF3340";

    return "#64748B";
  };

  const getRiskBackground = () => {
    if (prediction.risk === "LOW")
      return "bg-[#22C55E]/10";

    if (prediction.risk === "MODERATE")
      return "bg-[#3B82F6]/10";

    if (prediction.risk === "HIGH")
      return "bg-[#F59E0B]/10";

    if (prediction.risk === "CRITICAL")
      return "bg-[#EF3340]/10";

    return "bg-[#64748B]/10";
  };

  const getRiskBorder = () => {
    if (prediction.risk === "LOW")
      return "border-[#22C55E]/20";

    if (prediction.risk === "MODERATE")
      return "border-[#3B82F6]/20";

    if (prediction.risk === "HIGH")
      return "border-[#F59E0B]/20";

    if (prediction.risk === "CRITICAL")
      return "border-[#EF3340]/20";

    return "border-[#64748B]/20";
  };

  const getRiskLabel = () => {
    if (prediction.risk === "CRITICAL")
      return "Critical flood conditions";

    if (prediction.risk === "HIGH")
      return "Elevated flood conditions";

    if (prediction.risk === "MODERATE")
      return "Moderate flood conditions";

    if (prediction.risk === "LOW")
      return "Low flood conditions";

    return "Flood conditions";
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2">

          <p className="text-xs font-semibold tracking-wider text-[#3B82F6]">
            AI FLOOD PREDICTION
          </p>

          <span className="px-2 py-1 rounded-full text-[9px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            LIVE MONITORING
          </span>

        </div>

        <h1 className="text-3xl font-bold text-[#F1F5F9] mt-2">
          Flood Prediction
        </h1>

        <p className="text-sm text-[#8FA4C7] mt-2">
          HawkVision automatically monitors environmental
          conditions and detects flood risk.
        </p>
      </div>


      {/* AUTOMATIC MONITORING STATUS */}
      <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl px-5 py-4">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
              <Radio
                size={19}
                className="text-[#22C55E]"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#F1F5F9]">
                Automatic Flood Monitoring Active
              </p>

              <p className="text-xs text-[#64748B] mt-1">
                Monitoring 7 locations across Pakistan
              </p>
            </div>

          </div>


          <div className="flex items-center gap-5">

            <div className="flex items-center gap-2 text-xs text-[#8FA4C7]">
              <Clock3
                size={14}
                className="text-[#3B82F6]"
              />

              <span>
                Auto refresh:{" "}
                <span className="text-[#F1F5F9]">
                  10 min
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#22C55E]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              System Active
            </div>

          </div>

        </div>

      </div>


      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ENVIRONMENTAL CONDITIONS */}
        <div className="xl:col-span-2 bg-[#111C31] border border-[#1D304D] rounded-2xl p-6">

          {/* CARD HEADER */}
          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                <Waves
                  size={20}
                  className="text-[#3B82F6]"
                />
              </div>

              <div>
                <h2 className="font-semibold text-[#F1F5F9]">
                  Environmental Conditions
                </h2>

                <p className="text-xs text-[#64748B]">
                  Automatically collected live data
                </p>
              </div>

            </div>


            <div className="flex items-center gap-2 text-[10px] text-[#22C55E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              LIVE
            </div>

          </div>


          {/* LOCATION */}
          <div className="mb-6">

            <label className="text-sm text-[#8FA4C7]">
              Monitoring Location
            </label>

            <div className="relative mt-2">

              <MapPin
                size={18}
                className="absolute left-3 top-3 text-[#64748B]"
              />

              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setAiAlert(null);
                }}
                className="w-full h-11 rounded-xl bg-[#080F1E] border border-[#1D304D] pl-10 pr-4 text-sm text-[#F1F5F9] outline-none focus:border-[#3B82F6]"
              >
                {LOCATIONS.map((city) => (
                  <option
                    key={city}
                    value={city}
                  >
                    {city}
                  </option>
                ))}
              </select>

            </div>

            <p className="text-[10px] text-[#64748B] mt-2">
              Select a location to inspect its latest
              automatically monitored conditions.
            </p>

          </div>


          {/* AUTOMATIC DATA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            {/* RAINFALL */}
            <div className="p-4 rounded-xl bg-[#080F1E] border border-[#1D304D]">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <CloudRain
                    size={17}
                    className="text-[#3B82F6]"
                  />

                  <span className="text-sm text-[#8FA4C7]">
                    Rainfall
                  </span>

                </div>

                <span className="text-lg font-semibold text-[#F1F5F9]">
                  {loading
                    ? "..."
                    : environment.rainfall !== null
                    ? `${environment.rainfall} mm`
                    : "--"}
                </span>

              </div>

              <p className="text-xs text-[#64748B] mt-2">
                {environment.rainfallPeriod ||
                  "OpenWeather"}
              </p>

            </div>


            {/* WATER LEVEL */}
            <div className="p-4 rounded-xl bg-[#080F1E] border border-[#1D304D]">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Gauge
                    size={17}
                    className="text-[#3B82F6]"
                  />

                  <span className="text-sm text-[#8FA4C7]">
                    Water Level
                  </span>

                </div>

                <span className="text-lg font-semibold text-[#F1F5F9]">
                  {loading
                    ? "..."
                    : environment.waterLevel !== null
                    ? `${environment.waterLevel}%`
                    : "--"}
                </span>

              </div>

              <p className="text-xs text-[#64748B] mt-2">
                {environment.waterLevelSource ||
                  "Environmental monitoring layer"}
              </p>

            </div>


            {/* TEMPERATURE */}
            <div className="p-4 rounded-xl bg-[#080F1E] border border-[#1D304D]">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Thermometer
                    size={17}
                    className="text-[#3B82F6]"
                  />

                  <span className="text-sm text-[#8FA4C7]">
                    Temperature
                  </span>

                </div>

                <span className="text-lg font-semibold text-[#F1F5F9]">
                  {loading
                    ? "..."
                    : environment.temperature !== null
                    ? `${environment.temperature}°C`
                    : "--"}
                </span>

              </div>

              <p className="text-xs text-[#64748B] mt-2">
                Current weather
              </p>

            </div>


            {/* HUMIDITY */}
            <div className="p-4 rounded-xl bg-[#080F1E] border border-[#1D304D]">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Droplets
                    size={17}
                    className="text-[#3B82F6]"
                  />

                  <span className="text-sm text-[#8FA4C7]">
                    Humidity
                  </span>

                </div>

                <span className="text-lg font-semibold text-[#F1F5F9]">
                  {loading
                    ? "..."
                    : environment.humidity !== null
                    ? `${environment.humidity}%`
                    : "--"}
                </span>

              </div>

              <p className="text-xs text-[#64748B] mt-2">
                Current weather
              </p>

            </div>

          </div>


          {/* WEATHER CONDITION */}
          {environment.weatherCondition && (
            <div className="mb-6 p-4 rounded-xl bg-[#080F1E] border border-[#1D304D]">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs text-[#64748B]">
                    Current Weather
                  </p>

                  <p className="text-sm font-semibold text-[#F1F5F9] mt-1 capitalize">
                    {environment.weatherCondition}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#3B82F6]">
                  <Database size={15} />
                  OpenWeather
                </div>

              </div>

            </div>
          )}


          {/* DATA SOURCES */}
          {environment.dataSource && (
            <div className="mb-5 p-3 rounded-xl bg-[#080F1E] border border-[#1D304D] space-y-2">

              <div className="flex items-center gap-2 text-xs text-[#8FA4C7]">

                <Database
                  size={14}
                  className="text-[#3B82F6]"
                />

                <span>
                  Data source:{" "}
                  <span className="text-[#F1F5F9]">
                    {environment.dataSource}
                  </span>
                </span>

              </div>

              {environment.weatherSource && (
                <div className="text-[11px] text-[#64748B] pl-6">
                  Weather:{" "}
                  {environment.weatherSource}
                </div>
              )}

              {environment.waterLevelSource && (
                <div className="text-[11px] text-[#64748B] pl-6">
                  Water level:{" "}
                  {environment.waterLevelSource}
                </div>
              )}

            </div>
          )}


          {/* ERROR */}
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/20 flex gap-3">

              <AlertTriangle
                size={19}
                className="text-[#EF3340] mt-0.5 shrink-0"
              />

              <div>

                <p className="text-sm font-medium text-[#F1F5F9]">
                  Monitoring data unavailable
                </p>

                <p className="text-xs text-[#8FA4C7] mt-1 leading-relaxed">
                  {error}
                </p>

              </div>

            </div>
          )}


          {/* MANUAL REFRESH */}
          <button
            onClick={() =>
              fetchFloodData(
                location,
                true
              )
            }
            disabled={refreshing || loading}
            className="w-full h-12 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition flex items-center justify-center gap-2"
          >

            {refreshing ? (
              <>
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />

                Refreshing Live Data...
              </>
            ) : (
              <>
                <RefreshCw size={17} />

                Refresh Selected Location
              </>
            )}

          </button>


          {/* LAST UPDATE */}
          {lastUpdated && !loading && (
            <p className="text-[10px] text-[#64748B] text-center mt-3">

              Last updated:{" "}

              {new Date(
                lastUpdated
              ).toLocaleString()}

            </p>
          )}

        </div>


        {/* PREDICTION RESULT */}
        <div className="bg-[#111C31] border border-[#1D304D] rounded-2xl p-6">

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">

              <TrendingUp
                size={20}
                className="text-[#F59E0B]"
              />

            </div>

            <div>

              <h2 className="font-semibold text-[#F1F5F9]">
                Prediction
              </h2>

              <p className="text-xs text-[#64748B]">
                Automatic AI risk assessment
              </p>

            </div>

          </div>


          {loading ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center">

              <RefreshCw
                size={35}
                className="text-[#3B82F6] animate-spin mb-4"
              />

              <p className="text-sm text-[#8FA4C7]">
                Loading live flood conditions...
              </p>

            </div>
          ) : !prediction.risk ? (

            <div className="h-[300px] flex flex-col items-center justify-center text-center">

              <Waves
                size={42}
                className="text-[#1D304D] mb-4"
              />

              <p className="text-sm text-[#8FA4C7]">
                No prediction available
              </p>

              <p className="text-xs text-[#64748B] mt-2 max-w-[220px]">
                Live monitoring data could not be loaded.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {/* RISK CARD */}
              <div
                className={`p-5 rounded-xl border ${getRiskBackground()} ${getRiskBorder()}`}
              >

                <div className="flex items-center justify-between">

                  <p className="text-xs text-[#8FA4C7]">
                    Flood Risk
                  </p>

                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      color: getRiskColor(),
                      backgroundColor:
                        `${getRiskColor()}18`,
                    }}
                  >
                    {prediction.risk}
                  </span>

                </div>


                <div className="flex items-end justify-between mt-2">

                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: getRiskColor(),
                    }}
                  >
                    {prediction.risk}
                  </span>

                  <span className="text-sm text-[#8FA4C7]">
                    {prediction.percentage}%
                  </span>

                </div>


                {/* PROGRESS */}
                <div className="mt-4 h-2 rounded-full bg-[#080F1E] overflow-hidden">

                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        prediction.percentage
                      )}%`,

                      backgroundColor:
                        getRiskColor(),
                    }}
                  />

                </div>

              </div>


              {/* RECOMMENDATION */}
              <div
                className={`p-4 rounded-xl ${getRiskBackground()} border ${getRiskBorder()} flex gap-3`}
              >

                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0"
                  style={{
                    color: getRiskColor(),
                  }}
                />

                <div>

                  <p className="text-sm font-medium text-[#F1F5F9]">
                    {getRiskLabel()}
                  </p>

                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    {prediction.recommendation}
                  </p>

                </div>

              </div>


              {/* AI ALERT */}
              {aiAlert && (
                <div className="p-4 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/20">

                  <div className="flex items-center justify-between mb-3">

                    <div className="flex items-center gap-2">

                      <div className="w-8 h-8 rounded-lg bg-[#EF3340]/10 flex items-center justify-center">

                        <Sparkles
                          size={16}
                          className="text-[#EF3340]"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-semibold text-[#F1F5F9]">
                          AI Alert Generated
                        </p>

                        <p className="text-[10px] text-[#64748B]">
                          Groq Disaster Intelligence
                        </p>

                      </div>

                    </div>


                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        aiAlert.action ===
                        "UPDATED"
                          ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                          : "bg-[#22C55E]/10 text-[#22C55E]"
                      }`}
                    >
                      {aiAlert.action ===
                      "UPDATED"
                        ? "UPDATED"
                        : "NEW ALERT"}
                    </span>

                  </div>


                  <p className="text-sm text-[#8FA4C7] leading-relaxed">
                    {aiAlert.title}
                  </p>


                  <div className="flex items-center justify-between mt-4">

                    <span className="text-xs text-[#64748B]">
                      Severity
                    </span>

                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          aiAlert.severity ===
                          "CRITICAL"
                            ? "#EF3340"
                            : aiAlert.severity ===
                              "HIGH"
                            ? "#F59E0B"
                            : "#3B82F6",
                      }}
                    >
                      {aiAlert.severity}
                    </span>

                  </div>


                  {aiAlert.confidence !==
                    undefined && (
                    <div className="flex items-center justify-between mt-2">

                      <span className="text-xs text-[#64748B]">
                        AI Confidence
                      </span>

                      <span className="text-xs font-semibold text-[#F1F5F9]">

                        {Math.round(
                          aiAlert.confidence *
                            100
                        )}
                        %

                      </span>

                    </div>
                  )}


                  <div className="mt-3 pt-3 border-t border-[#1D304D]">

                    <p className="text-[11px] text-[#64748B]">

                      {aiAlert.action ===
                      "UPDATED"
                        ? "Existing active alert was updated with the latest analysis."
                        : "A new AI-generated emergency alert was created."}

                    </p>

                  </div>

                </div>
              )}


              {/* SELECTED LOCATION SUMMARY */}
              <div className="grid grid-cols-2 gap-3">

                <div className="p-3 rounded-xl bg-[#080F1E] border border-[#1D304D]">

                  <p className="text-xs text-[#64748B]">
                    Location
                  </p>

                  <p className="text-sm font-semibold mt-1 text-[#F1F5F9]">
                    {location}
                  </p>

                </div>


                <div className="p-3 rounded-xl bg-[#080F1E] border border-[#1D304D]">

                  <p className="text-xs text-[#64748B]">
                    Weather
                  </p>

                  <p className="text-sm font-semibold mt-1 text-[#F1F5F9] capitalize">
                    {environment.weatherCondition ||
                      "--"}
                  </p>

                </div>


                <div className="p-3 rounded-xl bg-[#080F1E] border border-[#1D304D]">

                  <p className="text-xs text-[#64748B]">
                    Rainfall
                  </p>

                  <p className="text-sm font-semibold mt-1 text-[#F1F5F9]">
                    {environment.rainfall !==
                    null
                      ? `${environment.rainfall} mm`
                      : "--"}
                  </p>

                </div>


                <div className="p-3 rounded-xl bg-[#080F1E] border border-[#1D304D]">

                  <p className="text-xs text-[#64748B]">
                    Water Level
                  </p>

                  <p className="text-sm font-semibold mt-1 text-[#F1F5F9]">
                    {environment.waterLevel !==
                    null
                      ? `${environment.waterLevel}%`
                      : "--"}
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default FloodPrediction;