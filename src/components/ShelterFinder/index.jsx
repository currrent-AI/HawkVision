import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Users,
  BedDouble,
  Navigation,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";


/* =========================================================
   SHELTER DATA
========================================================= */

const shelters = [
  {
    id: 1,
    name: "Model Town Emergency Shelter",
    location: "Model Town, Lahore",
    distance: 1.8,
    capacity: 500,
    available: 320,
    status: "Available",
    position: [31.4825, 74.3248],
  },
  {
    id: 2,
    name: "Johar Town Relief Center",
    location: "Johar Town, Lahore",
    distance: 3.2,
    capacity: 300,
    available: 180,
    status: "Available",
    position: [31.4697, 74.2728],
  },
  {
    id: 3,
    name: "Township Evacuation Center",
    location: "Township, Lahore",
    distance: 4.7,
    capacity: 700,
    available: 95,
    status: "Limited",
    position: [31.4479, 74.3048],
  },
  {
    id: 4,
    name: "Gulberg Emergency Center",
    location: "Gulberg, Lahore",
    distance: 5.4,
    capacity: 400,
    available: 0,
    status: "Full",
    position: [31.5204, 74.3587],
  },
  {
    id: 5,
    name: "DHA Relief Shelter",
    location: "DHA Phase 5, Lahore",
    distance: 7.1,
    capacity: 600,
    available: 410,
    status: "Available",
    position: [31.4697, 74.4108],
  },
];


/* =========================================================
   MAP CONTROLLER
========================================================= */

function MapController({ selectedShelter }) {
  const map = useMap();

  if (selectedShelter) {
    map.flyTo(selectedShelter.position, 12, {
      duration: 1.2,
    });
  }

  return null;
}


/* =========================================================
   CUSTOM MARKER
========================================================= */

const createMarker = (shelter, isRecommended, isSelected) => {
  let color = "#22C55E";

  if (shelter.status === "Limited") {
    color = "#F59E0B";
  }

  if (shelter.status === "Full") {
    color = "#EF3340";
  }

  if (isRecommended) {
    color = "#EF3340";
  }

  return L.divIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">

        ${
          isRecommended
            ? `
              <div style="
                position:absolute;
                width:42px;
                height:42px;
                border-radius:50%;
                background:${color}22;
                border:1px solid ${color}66;
                animation:pulse 1.8s infinite;
              "></div>
            `
            : ""
        }

        <div style="
          width:${isSelected ? "36px" : "30px"};
          height:${isSelected ? "36px" : "30px"};
          border-radius:50%;
          background:${color}22;
          border:2px solid ${color};
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 0 18px ${color}66;
          transition:all .2s ease;
        ">

          <div style="
            width:9px;
            height:9px;
            border-radius:50%;
            background:${color};
            box-shadow:0 0 10px ${color};
          "></div>

        </div>

      </div>

      <style>
        @keyframes pulse {
          0% {
            transform:scale(.8);
            opacity:.9;
          }
          70% {
            transform:scale(1.5);
            opacity:0;
          }
          100% {
            transform:scale(1.5);
            opacity:0;
          }
        }
      </style>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

function ShelterFinder() {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedShelter, setSelectedShelter] = useState(null);


  /* =======================================================
     FILTERED SHELTERS
  ======================================================= */

  const filteredShelters = useMemo(() => {
    return shelters
      .filter((shelter) => {

        const matchesSearch =
          shelter.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          shelter.location
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesFilter =
          filter === "All" ||
          shelter.status === filter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a.distance - b.distance);

  }, [search, filter]);


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalCapacity = shelters.reduce(
    (sum, shelter) => sum + shelter.capacity,
    0
  );

  const availableBeds = shelters.reduce(
    (sum, shelter) => sum + shelter.available,
    0
  );

  const availableShelters = shelters.filter(
    (shelter) => shelter.status !== "Full"
  ).length;


  /* =======================================================
     AI RECOMMENDATION
  ======================================================= */

  const recommendedShelter = useMemo(() => {

    const eligible = shelters.filter(
      (shelter) => shelter.status !== "Full"
    );

    if (!eligible.length) {
      return null;
    }

    return [...eligible].sort((a, b) => {

      const availabilityA =
        a.available / a.capacity;

      const availabilityB =
        b.available / b.capacity;

      const distanceA =
        1 / a.distance;

      const distanceB =
        1 / b.distance;

      const scoreA =
        availabilityA * 0.6 +
        distanceA * 0.4;

      const scoreB =
        availabilityB * 0.6 +
        distanceB * 0.4;

      return scoreB - scoreA;

    })[0];

  }, []);


  /* =======================================================
     HELPERS
  ======================================================= */

  const getStatusStyle = (status) => {

    if (status === "Available") {
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    }

    if (status === "Limited") {
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }

    return "text-red-400 bg-red-400/10 border-red-400/20";
  };


  const getCapacityColor = (status) => {

    if (status === "Full") {
      return "bg-red-400";
    }

    if (status === "Limited") {
      return "bg-amber-400";
    }

    return "bg-emerald-400";
  };


  const handleNavigate = (shelter) => {

    const query = encodeURIComponent(
      `${shelter.name}, ${shelter.location}`
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );
  };


  const selectShelter = (shelter) => {
    setSelectedShelter(shelter);
  };


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div>

        <p className="text-xs font-semibold tracking-[0.18em] text-[#EF3340]">
          EMERGENCY SHELTER NETWORK
        </p>

        <h1 className="text-3xl font-bold mt-2 text-[#F8FAFC]">
          Shelter Finder
        </h1>

        <p className="text-sm text-[#8FA4C7] mt-2">
          Locate nearby emergency shelters and coordinate safe evacuation.
        </p>

      </div>


      {/* ===================================================
          STATISTICS
      =================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Available */}

        <div className="bg-[#0D1628] border border-[#1D304D] rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-[#8FA4C7]">
                Available Shelters
              </p>

              <h2 className="text-3xl font-bold mt-2 text-[#F8FAFC]">
                {availableShelters}
              </h2>

            </div>

            <div className="p-3 rounded-xl bg-emerald-400/10">
              <ShieldCheck
                size={23}
                className="text-emerald-400"
              />
            </div>

          </div>

        </div>


        {/* Capacity */}

        <div className="bg-[#0D1628] border border-[#1D304D] rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-[#8FA4C7]">
                Total Capacity
              </p>

              <h2 className="text-3xl font-bold mt-2 text-[#F8FAFC]">
                {totalCapacity.toLocaleString()}
              </h2>

            </div>

            <div className="p-3 rounded-xl bg-blue-400/10">
              <Users
                size={23}
                className="text-blue-400"
              />
            </div>

          </div>

        </div>


        {/* Beds */}

        <div className="bg-[#0D1628] border border-[#1D304D] rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-[#8FA4C7]">
                Available Beds
              </p>

              <h2 className="text-3xl font-bold mt-2 text-[#F8FAFC]">
                {availableBeds.toLocaleString()}
              </h2>

            </div>

            <div className="p-3 rounded-xl bg-[#EF3340]/10">
              <BedDouble
                size={23}
                className="text-[#EF3340]"
              />
            </div>

          </div>

        </div>

      </div>


      {/* ===================================================
          AI RECOMMENDATION
      =================================================== */}

      {recommendedShelter && (

        <div className="relative overflow-hidden bg-gradient-to-r from-[#111D31] to-[#0C1526] border border-[#EF3340]/25 rounded-2xl p-5">

          <div className="absolute -top-20 -right-16 w-48 h-48 rounded-full bg-[#EF3340]/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            {/* Recommendation info */}

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/20 flex items-center justify-center shrink-0">

                <Sparkles
                  size={21}
                  className="text-[#EF3340]"
                />

              </div>


              <div>

                <div className="flex items-center gap-2">

                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#EF3340]">
                    AI RECOMMENDATION
                  </p>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-[9px] font-medium text-emerald-400">
                    OPTIMAL
                  </span>

                </div>

                <h2 className="text-lg font-semibold text-[#F8FAFC] mt-1">
                  Best Shelter for Evacuation
                </h2>

                <p className="text-xs text-[#7185A7] mt-1">
                  Based on distance, available capacity and shelter status.
                </p>

              </div>

            </div>


            {/* Recommendation */}

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={() =>
                  selectShelter(recommendedShelter)
                }
                className="px-4 py-3 rounded-xl bg-[#080D1A] border border-[#1D304D] hover:border-[#EF3340]/40 text-left transition"
              >

                <p className="text-sm font-semibold text-[#F8FAFC]">
                  {recommendedShelter.name}
                </p>

                <div className="flex items-center gap-4 mt-2">

                  <span className="flex items-center gap-1 text-[11px] text-[#8FA4C7]">
                    <MapPin size={12} />
                    {recommendedShelter.distance} km
                  </span>

                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <BedDouble size={12} />
                    {recommendedShelter.available} beds
                  </span>

                </div>

              </button>


              <button
                onClick={() =>
                  handleNavigate(recommendedShelter)
                }
                className="h-12 px-5 rounded-xl bg-[#EF3340] hover:bg-[#D92D3A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(239,51,64,0.12)]"
              >

                <Navigation size={15} />

                Navigate

              </button>

            </div>

          </div>

        </div>

      )}


      {/* ===================================================
          SEARCH + FILTER
      =================================================== */}

      <div className="bg-[#0D1628] border border-[#1D304D] rounded-2xl p-4">

        <div className="flex flex-col xl:flex-row gap-3">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search shelters, areas or locations..."
              className="w-full h-11 bg-[#080D1A] border border-[#1D304D] rounded-xl pl-11 pr-4 text-sm text-[#F8FAFC] placeholder:text-[#617493] outline-none focus:border-[#EF3340]/50 transition"
            />

          </div>


          {/* Filters */}

          <div className="flex items-center gap-2 overflow-x-auto">

            <SlidersHorizontal
              size={17}
              className="text-[#7185A7] shrink-0"
            />

            {["All", "Available", "Limited", "Full"].map(
              (item) => (

                <button
                  key={item}
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    filter === item
                      ? "bg-[#EF3340] text-white"
                      : "bg-[#16233A] text-[#8FA4C7] hover:bg-[#1D304D] hover:text-white"
                  }`}
                >
                  {item}
                </button>

              )
            )}

          </div>

        </div>

      </div>


      {/* ===================================================
          MAP + SHELTER LIST
      =================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


        {/* =================================================
            MAP
        ================================================= */}

        <div className="xl:col-span-2 bg-[#0D1628] border border-[#1D304D] rounded-2xl overflow-hidden">

          {/* Map Header */}

          <div className="p-5 border-b border-[#1D304D] flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-[#F8FAFC]">
                Live Shelter Network
              </h2>

              <p className="text-xs text-[#7185A7] mt-1">
                Emergency shelter locations across Lahore
              </p>

            </div>


            <div className="flex items-center gap-2 text-xs text-emerald-400">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />

              </span>

              LIVE

            </div>

          </div>


          {/* Actual Leaflet Map */}

          <div className="h-[520px] relative">

            <MapContainer
              center={[31.5204, 74.3587]}
              zoom={11}
              scrollWheelZoom={true}
              className="h-full w-full"
            >

              <TileLayer
                attribution="&copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              />


              <MapController
                selectedShelter={selectedShelter}
              />


              {shelters.map((shelter) => {

                const isRecommended =
                  recommendedShelter?.id === shelter.id;

                const isSelected =
                  selectedShelter?.id === shelter.id;

                return (

                  <div key={shelter.id}>

                    <Marker
                      position={shelter.position}
                      icon={createMarker(
                        shelter,
                        isRecommended,
                        isSelected
                      )}
                      eventHandlers={{
                        click: () =>
                          selectShelter(shelter),
                      }}
                    >

                      <Popup>

                        <div className="min-w-[210px]">

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="font-semibold text-slate-900">
                                {shelter.name}
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                {shelter.location}
                              </p>

                            </div>

                            <span
                              className={`text-[10px] px-2 py-1 rounded-md border ${getStatusStyle(
                                shelter.status
                              )}`}
                            >
                              {shelter.status}
                            </span>

                          </div>


                          <div className="grid grid-cols-2 gap-2 mt-3">

                            <div className="bg-slate-100 rounded-lg p-2">

                              <p className="text-[10px] text-slate-500">
                                Available
                              </p>

                              <p className="text-sm font-semibold text-slate-800">
                                {shelter.available}
                              </p>

                            </div>

                            <div className="bg-slate-100 rounded-lg p-2">

                              <p className="text-[10px] text-slate-500">
                                Distance
                              </p>

                              <p className="text-sm font-semibold text-slate-800">
                                {shelter.distance} km
                              </p>

                            </div>

                          </div>


                          <button
                            onClick={() =>
                              handleNavigate(shelter)
                            }
                            disabled={
                              shelter.status === "Full"
                            }
                            className={`w-full mt-3 py-2 rounded-lg text-xs font-semibold ${
                              shelter.status === "Full"
                                ? "bg-slate-200 text-slate-400"
                                : "bg-red-500 text-white"
                            }`}
                          >

                            {shelter.status === "Full"
                              ? "Shelter Full"
                              : "Get Directions"}

                          </button>

                        </div>

                      </Popup>

                    </Marker>


                    {/* Recommended radius */}

                    {isRecommended && (

                      <Circle
                        center={shelter.position}
                        radius={500}
                        pathOptions={{
                          color: "#EF3340",
                          fillColor: "#EF3340",
                          fillOpacity: 0.05,
                          weight: 1,
                        }}
                      />

                    )}

                  </div>

                );

              })}

            </MapContainer>


            {/* Legend */}

            <div className="absolute z-[1000] bottom-5 right-5 bg-[#080D1A]/90 border border-[#1D304D] rounded-xl px-4 py-3 backdrop-blur">

              <p className="text-[10px] uppercase tracking-wider text-[#617493] mb-2">
                Shelter Status
              </p>

              <div className="space-y-2">

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-[#8FA4C7]">
                    Available
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[11px] text-[#8FA4C7]">
                    Limited
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[11px] text-[#8FA4C7]">
                    Full
                  </span>
                </div>

              </div>

            </div>


            {/* Selected Shelter */}

            {selectedShelter && (

              <div className="absolute z-[1000] top-4 left-4 bg-[#080D1A]/95 border border-[#EF3340]/30 rounded-xl px-4 py-3 backdrop-blur max-w-[270px]">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="text-[10px] uppercase tracking-wider text-[#EF3340]">
                      Selected Shelter
                    </p>

                    <p className="text-sm font-semibold text-[#F8FAFC] mt-1">
                      {selectedShelter.name}
                    </p>

                    <p className="text-xs text-[#7185A7] mt-1">
                      {selectedShelter.available} beds available
                    </p>

                  </div>


                  <button
                    onClick={() =>
                      setSelectedShelter(null)
                    }
                    className="text-[#7185A7] hover:text-white"
                  >
                    <X size={15} />
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            SHELTER LIST
        ================================================= */}

        <div className="bg-[#0D1628] border border-[#1D304D] rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-[#1D304D]">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-[#F8FAFC]">
                  Nearby Shelters
                </h2>

                <p className="text-xs text-[#7185A7] mt-1">
                  {filteredShelters.length} shelters found
                </p>

              </div>

              <MapPin
                size={19}
                className="text-[#EF3340]"
              />

            </div>

          </div>


          <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">

            {filteredShelters.length > 0 ? (

              filteredShelters.map((shelter) => {

                const percentage =
                  (shelter.available /
                    shelter.capacity) *
                  100;

                const isRecommended =
                  recommendedShelter?.id === shelter.id;

                const isSelected =
                  selectedShelter?.id === shelter.id;

                return (

                  <div
                    key={shelter.id}
                    onClick={() =>
                      selectShelter(shelter)
                    }
                    className={`p-4 rounded-xl bg-[#080D1A] border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#EF3340]/60 bg-[#101A2C]"
                        : isRecommended
                        ? "border-[#EF3340]/35"
                        : "border-[#1D304D] hover:border-[#29405F]"
                    }`}
                  >

                    {/* AI Badge */}

                    {isRecommended && (

                      <div className="flex items-center gap-1.5 mb-3">

                        <Sparkles
                          size={12}
                          className="text-[#EF3340]"
                        />

                        <span className="text-[10px] font-semibold text-[#EF3340] uppercase tracking-wider">
                          AI Recommended
                        </span>

                      </div>

                    )}


                    {/* Title */}

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <h3 className="text-sm font-semibold text-[#F8FAFC]">
                          {shelter.name}
                        </h3>

                        <div className="flex items-center gap-1 mt-2 text-xs text-[#7185A7]">

                          <MapPin size={13} />

                          {shelter.location}

                        </div>

                      </div>


                      <span
                        className={`px-2 py-1 rounded-md border text-[10px] font-medium whitespace-nowrap ${getStatusStyle(
                          shelter.status
                        )}`}
                      >
                        {shelter.status}
                      </span>

                    </div>


                    {/* Stats */}

                    <div className="flex items-center justify-between mt-4">

                      <div>

                        <p className="text-[11px] text-[#617493]">
                          Available
                        </p>

                        <p className="text-sm font-semibold text-[#F8FAFC]">
                          {shelter.available} /{" "}
                          {shelter.capacity}
                        </p>

                      </div>


                      <div className="text-right">

                        <p className="text-[11px] text-[#617493]">
                          Distance
                        </p>

                        <p className="text-sm font-semibold text-[#F8FAFC]">
                          {shelter.distance} km
                        </p>

                      </div>

                    </div>


                    {/* Capacity */}

                    <div className="mt-3">

                      <div className="h-1.5 bg-[#16233A] rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full ${getCapacityColor(
                            shelter.status
                          )}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>


                      <div className="flex justify-between mt-1">

                        <span className="text-[10px] text-[#617493]">
                          Capacity
                        </span>

                        <span className="text-[10px] text-[#7185A7]">
                          {Math.round(percentage)}% available
                        </span>

                      </div>

                    </div>


                    {/* Navigate */}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(shelter);
                      }}
                      disabled={
                        shelter.status === "Full"
                      }
                      className={`w-full mt-3 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition ${
                        shelter.status === "Full"
                          ? "bg-[#16233A] text-[#617493] cursor-not-allowed"
                          : "bg-[#16233A] text-[#C8D5EA] hover:bg-[#EF3340] hover:text-white"
                      }`}
                    >

                      <Navigation size={14} />

                      {shelter.status === "Full"
                        ? "Shelter Full"
                        : "Get Directions"}

                    </button>

                  </div>

                );

              })

            ) : (

              <div className="py-12 text-center">

                <Search
                  size={28}
                  className="mx-auto text-[#536887]"
                />

                <p className="text-sm text-[#8FA4C7] mt-3">
                  No shelters found
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("All");
                  }}
                  className="text-xs text-[#EF3340] mt-2 hover:underline"
                >
                  Clear filters
                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default ShelterFinder;