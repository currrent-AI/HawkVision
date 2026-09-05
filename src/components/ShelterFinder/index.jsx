import {
  MapPin,
  ShieldCheck,
  Users,
  BedDouble,
  Search,
  Navigation,
  Route,
  Building2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import ShelterMap from "./ShelterMap";
import { useUserLocation } from "../../context/LocationContext";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const DEFAULT_LOCATION = {
  name: "Lahore",
  latitude: 31.5204,
  longitude: 74.3587,
};

function ShelterFinder() {
  const {
    coordinates: userLocation,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useUserLocation();

  const [shelters, setShelters] =
    useState([]);

  const [recommendation, setRecommendation] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const origin = useMemo(
    () =>
      userLocation
        ? {
            name: "Your location",
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }
        : DEFAULT_LOCATION,
    [userLocation]
  );


  /*
    Fetch shelters.
  */

  const fetchShelters = useCallback(
    async (showRefresh = false, signal) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_BASE}/api/shelters?lat=${origin.latitude}&lng=${origin.longitude}`,
          { signal }
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch shelters");
        }

        setShelters(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Shelter fetch error:", err);
          setError(err.message || "Unable to load shelters");
          setShelters([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [origin.latitude, origin.longitude]
  );

  const fetchRecommendation = useCallback(
    async (signal) => {
      try {
        const response = await fetch(
          `${API_BASE}/api/shelters/recommendation/best?lat=${origin.latitude}&lng=${origin.longitude}`,
          { signal }
        );
        const result = await response.json();

        if (response.ok && result.success) {
          setRecommendation(result.data);
        } else {
          setRecommendation(null);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Recommendation error:", err);
          setRecommendation(null);
        }
      }
    },
    [origin.latitude, origin.longitude]
  );

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchShelters(false, controller.signal);
      fetchRecommendation(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [fetchRecommendation, fetchShelters]);


  /*
    Filter/search.
  */

  const filteredShelters =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return shelters.filter(
        (shelter) => {
          const matchesSearch =
            !query ||
            shelter.name
              ?.toLowerCase()
              .includes(query) ||
            shelter.location
              ?.toLowerCase()
              .includes(query) ||
            shelter.address
              ?.toLowerCase()
              .includes(query);

          const status =
            shelter.calculatedStatus ||
            shelter.status;

          const matchesFilter =
            filter === "All" ||
            status === filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      shelters,
      search,
      filter,
    ]);

  const mappedShelters = useMemo(
    () =>
      filteredShelters.filter(
        (shelter) =>
          Number.isFinite(Number(shelter.latitude)) &&
          Number.isFinite(Number(shelter.longitude))
      ),
    [filteredShelters]
  );


  /*
    Statistics.
  */

  const stats = useMemo(() => {
    const active =
      shelters.filter(
        (shelter) =>
          (shelter.calculatedStatus ||
            shelter.status) !==
          "Closed"
      );

    const totalCapacity =
      shelters.reduce(
        (sum, shelter) =>
          sum +
          (Number(
            shelter.capacity
          ) || 0),
        0
      );

    const availableBeds =
      shelters.reduce(
        (sum, shelter) =>
          sum +
          (Number(
            shelter.availableBeds
          ) ||
            Math.max(
              0,
              (Number(
                shelter.capacity
              ) || 0) -
                (Number(
                  shelter.occupied
                ) || 0)
            )),
        0
      );

    return {
      availableShelters:
        active.length,

      totalCapacity,

      availableBeds,
    };
  }, [shelters]);


  /*
    Navigate using Google Maps.
  */

  const navigateToShelter =
    (shelter) => {
      if (
        !Number.isFinite(Number(shelter.latitude)) ||
        !Number.isFinite(Number(shelter.longitude))
      ) {
        return;
      }

      const url = new URL(
        "https://www.google.com/maps/dir/"
      );

      url.search = new URLSearchParams({
        api: "1",
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${shelter.latitude},${shelter.longitude}`,
      }).toString();

      window.open(
        url.toString(),
        "_blank",
        "noopener,noreferrer"
      );
    };


  /*
    Status helper.
  */

  const getStatus = (
    shelter
  ) => {
    return (
      shelter.calculatedStatus ||
      shelter.status ||
      "Available"
    );
  };


  const getStatusClasses = (
    status
  ) => {
    if (status === "Available") {
      return "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20";
    }

    if (status === "Limited") {
      return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
    }

    if (status === "Full") {
      return "bg-[#EF3340]/10 text-[#EF3340] border-[#EF3340]/20";
    }

    return "bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20";
  };


  const getStatusIcon = (
    status
  ) => {
    if (status === "Available") {
      return (
        <CheckCircle2
          size={13}
        />
      );
    }

    if (status === "Limited") {
      return (
        <Clock3 size={13} />
      );
    }

    if (status === "Full") {
      return (
        <XCircle size={13} />
      );
    }

    return (
      <AlertTriangle
        size={13}
      />
    );
  };


  return (
    <div className="space-y-5">

      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-[10px] font-bold tracking-[0.18em] text-[#EF3340]">
            EMERGENCY SHELTER NETWORK
          </p>

          <h1 className="text-3xl font-bold text-[#F1F5F9] mt-1">
            Shelter Finder
          </h1>

          <p className="text-xs text-[#8FA4C7] mt-2">
            Locate nearby emergency shelters and
            coordinate safe evacuation.
          </p>

        </div>

        <button
          onClick={() =>
            fetchShelters(true)
          }
          disabled={refreshing}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111C31] border border-[#1D304D] text-xs text-[#8FA4C7] hover:text-white hover:border-[#3B82F6] transition"
        >
          <RefreshCw
            size={14}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>


      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* AVAILABLE SHELTERS */}

        <div className="bg-[#111C31] border border-[#1D304D] rounded-xl p-4">

          <div className="flex items-center justify-between">

            <p className="text-[10px] text-[#8FA4C7]">
              Available Shelters
            </p>

            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
              <ShieldCheck
                size={16}
                className="text-[#22C55E]"
              />
            </div>

          </div>

          <p className="text-2xl font-bold text-[#F1F5F9] mt-1">
            {stats.availableShelters}
          </p>

        </div>


        {/* TOTAL CAPACITY */}

        <div className="bg-[#111C31] border border-[#1D304D] rounded-xl p-4">

          <div className="flex items-center justify-between">

            <p className="text-[10px] text-[#8FA4C7]">
              Total Capacity
            </p>

            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
              <Users
                size={16}
                className="text-[#3B82F6]"
              />
            </div>

          </div>

          <p className="text-2xl font-bold text-[#F1F5F9] mt-1">
            {stats.totalCapacity.toLocaleString()}
          </p>

        </div>


        {/* AVAILABLE BEDS */}

        <div className="bg-[#111C31] border border-[#1D304D] rounded-xl p-4">

          <div className="flex items-center justify-between">

            <p className="text-[10px] text-[#8FA4C7]">
              Available Beds
            </p>

            <div className="w-8 h-8 rounded-lg bg-[#EF3340]/10 flex items-center justify-center">
              <BedDouble
                size={16}
                className="text-[#EF3340]"
              />
            </div>

          </div>

          <p className="text-2xl font-bold text-[#F1F5F9] mt-1">
            {stats.availableBeds.toLocaleString()}
          </p>

        </div>

      </div>


      {/* RECOMMENDATION */}

      <div className="bg-[#111C31] border border-[#EF3340]/30 rounded-xl p-4">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-[#EF3340]/10 flex items-center justify-center">
              <Navigation
                size={17}
                className="text-[#EF3340]"
              />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <p className="text-[10px] font-bold tracking-wider text-[#EF3340]">
                  SMART RECOMMENDATION
                </p>

                {recommendation && (
                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                    OPTIMAL
                  </span>
                )}

              </div>

              <p className="text-sm font-semibold text-[#F1F5F9] mt-1">

                {recommendation
                  ? recommendation.name
                  : "Finding best shelter..."}

              </p>

              <p className="text-[10px] text-[#64748B] mt-1">

                {recommendation
                  ? recommendation.recommendationReason
                  : "Ranking shelters by distance, availability and capacity."}

              </p>

            </div>

          </div>


          {recommendation && (
            <div className="flex items-center gap-2">

              <div className="px-3 py-2 rounded-lg bg-[#080F1E] border border-[#1D304D]">

                <p className="text-[9px] text-[#64748B]">
                  Distance
                </p>

                <p className="text-xs font-semibold text-[#F1F5F9]">
                  {recommendation.distance !==
                  null
                    ? `${recommendation.distance} km`
                    : "--"}
                </p>

              </div>

              <button
                onClick={() =>
                  navigateToShelter(
                    recommendation
                  )
                }
                className="px-4 py-2 rounded-lg bg-[#EF3340] hover:bg-[#DC2634] text-white text-xs font-semibold flex items-center gap-2 transition"
              >
                <Navigation
                  size={13}
                />
                Navigate
              </button>

            </div>
          )}

        </div>

      </div>


      {/* SEARCH + FILTER */}

      <div className="bg-[#111C31] border border-[#1D304D] rounded-xl p-2 flex flex-col lg:flex-row gap-2">

        <div className="relative flex-1">

          <Search
            size={15}
            className="absolute left-3 top-3 text-[#64748B]"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search shelters, areas or locations..."
            className="w-full h-9 bg-[#080F1E] border border-[#1D304D] rounded-lg pl-9 pr-3 text-xs text-[#F1F5F9] placeholder:text-[#64748B] outline-none focus:border-[#3B82F6]"
          />

        </div>


        <div className="flex gap-1 overflow-x-auto">

          {[
            "All",
            "Available",
            "Limited",
            "Full",
          ].map((item) => (
            <button
              key={item}
              onClick={() =>
                setFilter(item)
              }
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold whitespace-nowrap transition ${
                filter === item
                  ? "bg-[#EF3340] text-white"
                  : "bg-[#080F1E] text-[#8FA4C7] border border-[#1D304D] hover:border-[#3B82F6]"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="p-4 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/20 flex items-center gap-3">

          <AlertTriangle
            size={18}
            className="text-[#EF3340]"
          />

          <div>

            <p className="text-sm font-semibold text-[#F1F5F9]">
              Shelter network unavailable
            </p>

            <p className="text-xs text-[#8FA4C7] mt-1">
              {error}
            </p>

          </div>

        </div>
      )}

      {locationLoading && (
        <div className="p-3 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center gap-3">
          <RefreshCw
            size={16}
            className="text-[#3B82F6] animate-spin"
          />
          <p className="text-xs text-[#8FA4C7]">
            Finding your location to update shelter distances.
          </p>
        </div>
      )}

      {locationError && !locationLoading && (
        <div className="p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center gap-3">
          <MapPin
            size={16}
            className="text-[#F59E0B]"
          />
          <p className="text-xs text-[#8FA4C7]">
            {locationError}
          </p>
        </div>
      )}


      {/* MAIN CONTENT */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* MAP */}

        <div className="xl:col-span-2 bg-[#111C31] border border-[#1D304D] rounded-xl overflow-hidden">

          <div className="p-3 border-b border-[#1D304D] flex items-center justify-between">

            <div>

              <p className="text-sm font-semibold text-[#F1F5F9]">
                Live Shelter Network
              </p>

              <p className="text-[9px] text-[#64748B]">
                Emergency shelter locations near{" "}
                {userLocation ? "your location" : origin.name}
              </p>

            </div>

            <div className="flex items-center gap-2 text-[9px] text-[#22C55E]">

              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />

              {locationLoading
                ? "LOCATING"
                : userLocation
                  ? "YOUR LOCATION"
                  : "DEFAULT AREA"}

            </div>

          </div>


          <div className="relative h-[420px] bg-[#080F1E]">

            <ShelterMap
              center={origin}
              shelters={mappedShelters}
              userLocation={userLocation}
              onNavigate={navigateToShelter}
              getStatus={getStatus}
            />

            {/* MAP OVERLAY */}

            <div className="absolute z-[1000] top-3 left-3 px-2 py-1 rounded-md bg-[#080F1E]/90 border border-[#1D304D] text-[9px] text-[#8FA4C7] pointer-events-none">
              {mappedShelters.length} mapped shelter locations
            </div>


            {/* LEGEND */}

            <div className="absolute z-[1000] bottom-3 right-3 bg-[#080F1E]/95 border border-[#1D304D] rounded-lg p-3 pointer-events-none">

              <p className="text-[9px] text-[#8FA4C7] mb-2">
                SHELTER STATUS
              </p>

              <div className="space-y-1.5">

                <div className="flex items-center gap-2 text-[8px] text-[#8FA4C7]">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  Available
                </div>

                <div className="flex items-center gap-2 text-[8px] text-[#8FA4C7]">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  Limited
                </div>

                <div className="flex items-center gap-2 text-[8px] text-[#8FA4C7]">
                  <span className="w-2 h-2 rounded-full bg-[#EF3340]" />
                  Full
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* NEARBY SHELTERS */}

        <div className="bg-[#111C31] border border-[#1D304D] rounded-xl overflow-hidden">

          <div className="p-3 border-b border-[#1D304D]">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-[#F1F5F9]">
                  Nearby Shelters
                </p>

                <p className="text-[9px] text-[#64748B]">
                  {filteredShelters.length} shelters found
                </p>

              </div>

              <MapPin
                size={15}
                className="text-[#EF3340]"
              />

            </div>

          </div>


          <div className="max-h-[420px] overflow-y-auto p-2 space-y-2">

            {loading ? (
              <div className="h-[300px] flex flex-col items-center justify-center">

                <RefreshCw
                  size={22}
                  className="text-[#3B82F6] animate-spin"
                />

                <p className="text-xs text-[#64748B] mt-3">
                  Loading shelter network...
                </p>

              </div>
            ) : filteredShelters.length ===
              0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center px-5">

                <Building2
                  size={28}
                  className="text-[#1D304D]"
                />

                <p className="text-xs text-[#8FA4C7] mt-3">
                  No shelters found
                </p>

                <p className="text-[10px] text-[#64748B] mt-1">
                  Try another search or filter.
                </p>

              </div>
            ) : (
              filteredShelters.map(
                (shelter) => {
                  const status =
                    getStatus(
                      shelter
                    );

                  const capacity =
                    Number(
                      shelter.capacity
                    ) || 0;

                  const available =
                    Number(
                      shelter.availableBeds
                    ) || 0;

                  const availabilityPercent =
                    capacity > 0
                      ? Math.round(
                          (available /
                            capacity) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={
                        shelter._id
                      }
                      className={`p-3 rounded-lg bg-[#080F1E] border ${
                        recommendation?._id ===
                        shelter._id
                          ? "border-[#EF3340]/50"
                          : "border-[#1D304D]"
                      }`}
                    >

                      {/* TOP */}

                      <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            {recommendation?._id ===
                              shelter._id && (
                              <span className="text-[7px] font-bold text-[#EF3340]">
                                AI RECOMMENDED
                              </span>
                            )}

                          </div>

                          <p className="text-xs font-semibold text-[#F1F5F9] truncate mt-1">
                            {shelter.name}
                          </p>

                          <p className="text-[9px] text-[#64748B] mt-1 truncate">
                            {shelter.location}
                            {shelter.address
                              ? `, ${shelter.address}`
                              : ""}
                          </p>

                        </div>


                        <span
                          className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border text-[8px] font-semibold ${getStatusClasses(
                            status
                          )}`}
                        >
                          {getStatusIcon(
                            status
                          )}

                          {status}
                        </span>

                      </div>


                      {/* CAPACITY */}

                      <div className="mt-3">

                        <div className="flex items-center justify-between">

                          <span className="text-[9px] text-[#64748B]">
                            Available
                          </span>

                          <span className="text-[9px] text-[#8FA4C7]">
                            {available.toLocaleString()} /{" "}
                            {capacity.toLocaleString()}
                          </span>

                        </div>

                        <div className="h-1.5 rounded-full bg-[#111C31] mt-1.5 overflow-hidden">

                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                availabilityPercent
                              )}%`,
                              background:
                                status ===
                                "Available"
                                  ? "#22C55E"
                                  : status ===
                                    "Limited"
                                  ? "#F59E0B"
                                  : "#EF3340",
                            }}
                          />

                        </div>

                      </div>


                      {/* DETAILS */}

                      <div className="flex items-center justify-between mt-3">

                        <div className="flex items-center gap-1.5">

                          <BedDouble
                            size={12}
                            className="text-[#3B82F6]"
                          />

                          <span className="text-[9px] text-[#8FA4C7]">
                            {available.toLocaleString()} beds
                          </span>

                        </div>


                        <div className="flex items-center gap-1.5">

                          <MapPin
                            size={12}
                            className="text-[#64748B]"
                          />

                          <span className="text-[9px] text-[#8FA4C7]">
                            {shelter.distance !==
                            null
                              ? `${shelter.distance} km`
                              : "--"}
                          </span>

                        </div>

                      </div>


                      {/* NAVIGATE */}

                      <button
                        onClick={() =>
                          navigateToShelter(
                            shelter
                          )
                        }
                        disabled={
                          !Number.isFinite(
                            Number(shelter.latitude)
                          ) ||
                          !Number.isFinite(
                            Number(shelter.longitude)
                          ) ||
                          status ===
                            "Closed"
                        }
                        className="w-full mt-3 h-7 rounded-md bg-[#111C31] hover:bg-[#1D304D] disabled:opacity-40 disabled:cursor-not-allowed border border-[#1D304D] text-[9px] font-semibold text-[#8FA4C7] flex items-center justify-center gap-1.5 transition"
                      >
                        <Route
                          size={11}
                        />

                        Get Directions

                      </button>

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>

      </div>


      {/* FOOTER INFORMATION */}

      <div className="bg-[#080F1E] border border-[#1D304D] rounded-xl p-3">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-2">

            <ShieldCheck
              size={14}
              className="text-[#22C55E]"
            />

            <span className="text-[9px] text-[#64748B]">
              Shelter availability is calculated from
              current capacity and occupancy data.
            </span>

          </div>

          <span className="text-[9px] text-[#64748B]">
            {userLocation
              ? "Current location:"
              : "Default area:"}{" "}
            <span className="text-[#F1F5F9]">
              {origin.name}
            </span>
          </span>

        </div>

      </div>

    </div>
  );
}

export default ShelterFinder;