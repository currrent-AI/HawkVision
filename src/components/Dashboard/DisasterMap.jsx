import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import { Activity, MapPin, Radio } from "lucide-react";
import "leaflet/dist/leaflet.css";

/* =========================================================
   MAPTILER
   API key comes from .env
   VITE_MAPTILER_KEY=your_key_here
========================================================= */
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const severityColors = {
  Critical: "#EF3340",
  High: "#F59E0B",
  Medium: "#3B82F6",
  Low: "#22C55E",
};

const getSeverityColor = (severity) =>
  severityColors[severity] || "#3B82F6";

/* =========================================================
   DISASTER MARKER
========================================================= */
const createMarker = (color) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width: 15px;
        height: 15px;
        background: ${color};
        border: 2px solid #F8FAFC;
        border-radius: 50%;
        box-shadow:
          0 0 0 5px ${color}22,
          0 0 18px ${color},
          0 0 30px ${color}66;
      "></div>
    `,
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
  });

/* =========================================================
   MAIN COMPONENT
========================================================= */
function DisasterMap({
  disasters = [],
  loading = false,
  error = null,
}) {
  const disasterLocations = disasters
    .filter(
      (disaster) =>
        typeof disaster.latitude === "number" &&
        typeof disaster.longitude === "number"
    )
    .map((disaster) => ({
      id: disaster._id,
      name: disaster.location,
      type: disaster.type,
      severity: disaster.severity,
      status: disaster.status,
      position: [disaster.latitude, disaster.longitude],
      color: getSeverityColor(disaster.severity),
    }));

  return (
    <div
      className="
        bg-[#0F192B]
        border border-[#1D304D]
        rounded-2xl
        p-6
        h-full
        shadow-[0_12px_40px_rgba(0,0,0,0.18)]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex items-center justify-between mb-5">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          {/* ICON */}
          <div
            className="
              w-16 h-16
              rounded-xl
              bg-[#12284A]
              border border-[#1D477D]
              flex items-center justify-center
              shadow-[inset_0_0_20px_rgba(59,130,246,0.08)]
            "
          >
            <MapPin
              size={28}
              className="text-[#3B82F6]"
            />
          </div>

          {/* TITLE */}
          <div>
            <h2 className="text-xl font-semibold text-[#F8FAFC]">
              Disaster Monitoring Map
            </h2>

            <p className="text-sm text-[#7194C5] mt-1">
              Real-time disaster activity across Pakistan
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">

          {/* NETWORK */}
          <div className="hidden md:flex items-center gap-2">
            <Activity
              size={17}
              className="text-[#22C55E]"
            />

            <span className="text-xs tracking-wide text-[#7194C5]">
              NETWORK ACTIVE
            </span>
          </div>

          {/* LIVE */}
          <div
            className="
              flex items-center gap-2
              px-4 py-2
              rounded-full
              bg-[#EF3340]/10
              border border-[#EF3340]/35
            "
          >
            <span className="relative flex h-2 w-2">

              <span
                className="
                  absolute
                  inline-flex
                  h-full w-full
                  rounded-full
                  bg-[#EF3340]
                  opacity-60
                  animate-ping
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-2 w-2
                  rounded-full
                  bg-[#EF3340]
                "
              />
            </span>

            <span className="text-xs font-semibold tracking-wide text-[#EF3340]">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAP CONTAINER
      ===================================================== */}
      <div
        className="
          relative
          rounded-2xl
          overflow-hidden
          border border-[#243A59]
          h-[420px]
          shadow-[0_10px_30px_rgba(0,0,0,0.25)]
        "
      >

        {/* ===================================================
            LOADING STATE
        =================================================== */}
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">

            <span
              className="
                w-2.5 h-2.5
                rounded-full
                bg-[#3B82F6]
                animate-pulse
                shadow-[0_0_10px_rgba(59,130,246,0.9)]
              "
            />

            <p className="text-sm text-[#8FA4C7]">
              Loading disaster data...
            </p>
          </div>

        ) : error ? (

          /* =================================================
             ERROR STATE
          ================================================= */
          <div
            className="
              h-full
              flex flex-col
              items-center
              justify-center
              gap-2
              px-6
              text-center
            "
          >
            <span
              className="
                w-2.5 h-2.5
                rounded-full
                bg-[#EF3340]
                shadow-[0_0_10px_rgba(239,51,64,0.9)]
              "
            />

            <p className="text-sm font-semibold text-[#EF3340]">
              Failed to load disaster data
            </p>

            <p className="text-xs text-[#64748B] max-w-[320px]">
              {error}
            </p>
          </div>

        ) : (

          /* =================================================
             MAP
          ================================================= */
          <>
            <MapContainer
              center={[30.3753, 69.3451]}
              zoom={5}

              /*
               * Map interaction
               * ----------------
               * 3  = country / regional view
               * 5  = initial Pakistan view
               * 20 = detailed city / street-level zoom
               */
              minZoom={3}
              maxZoom={20}

              scrollWheelZoom={true}
              doubleClickZoom={true}
              dragging={true}
              touchZoom={true}
              zoomControl={true}

              className="h-full w-full"
            >

              {/* =================================================
                  MAPTILER BASE MAP
                  Detailed streets / cities / roads
              ================================================= */}
              <TileLayer
                attribution='&copy; MapTiler &copy; OpenStreetMap contributors'
                url={`https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
                maxZoom={20}
              />

              {/* =================================================
                  DISASTER MARKERS
              ================================================= */}
              {disasterLocations.map((location) => (
                <div key={location.id}>

                  {/* MARKER */}
                  <Marker
                    position={location.position}
                    icon={createMarker(location.color)}
                  >
                    <Popup>
                      <div className="min-w-[190px]">

                        <div className="flex items-center gap-2 mb-2">
                          <Radio
                            size={15}
                            style={{
                              color: location.color,
                            }}
                          />

                          <h3 className="font-semibold">
                            {location.name}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-600">
                          {location.type}
                        </p>

                        <p
                          className="text-sm font-semibold mt-2"
                          style={{
                            color: location.color,
                          }}
                        >
                          {location.severity}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Status: {location.status}
                        </p>

                        <p className="text-[11px] text-gray-400 mt-1">
                          {location.position[0].toFixed(4)},{" "}
                          {location.position[1].toFixed(4)}
                        </p>

                      </div>
                    </Popup>
                  </Marker>

                  {/* =================================================
                      RISK RADIUS
                  ================================================= */}
                  <Circle
                    center={location.position}
                    radius={25000}
                    pathOptions={{
                      color: location.color,
                      fillColor: location.color,
                      fillOpacity: 0.07,
                      weight: 1,
                      opacity: 0.55,
                    }}
                  />

                </div>
              ))}

            </MapContainer>

            {/* =====================================================
                LAST UPDATE
            ===================================================== */}
            <div
              className="
                absolute
                top-4 right-4
                z-[1000]
                flex items-center gap-3
                px-4 py-2.5
                rounded-xl
                bg-[#08101F]/90
                backdrop-blur-md
                border border-[#29405F]
                shadow-[0_8px_25px_rgba(0,0,0,0.35)]
              "
            >
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#7186A8]">
                  Last Update
                </p>

                <p className="text-xs font-semibold text-[#F8FAFC] mt-0.5">
                  LIVE
                </p>
              </div>

              <span className="w-px h-6 bg-[#29405F]" />

              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />

                <span className="text-[10px] text-[#22C55E]">
                  SYNCED
                </span>
              </div>
            </div>

            {/* =====================================================
                BOTTOM STATUS LEGEND
            ===================================================== */}
            <div
              className="
                absolute
                bottom-4 left-4
                z-[1000]
                flex items-center gap-3
                px-3 py-2
                rounded-lg
                bg-[#08101F]/90
                backdrop-blur-md
                border border-[#29405F]
              "
            >

              {/* CRITICAL */}
              <div className="flex items-center gap-2">
                <span
                  className="
                    w-2 h-2
                    rounded-full
                    bg-[#EF3340]
                    shadow-[0_0_8px_rgba(239,51,64,0.8)]
                  "
                />

                <span className="text-[10px] text-[#AFC1DC]">
                  CRITICAL
                </span>
              </div>

              <div className="w-px h-4 bg-[#29405F]" />

              {/* WARNING */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />

                <span className="text-[10px] text-[#AFC1DC]">
                  WARNING
                </span>
              </div>

              <div className="w-px h-4 bg-[#29405F]" />

              {/* MODERATE */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />

                <span className="text-[10px] text-[#AFC1DC]">
                  MODERATE
                </span>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DisasterMap;