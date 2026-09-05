import { useState } from "react";
import {
  Bot,
  Send,
  MapPin,
  Paperclip,
  Zap,
  ShieldAlert,
  Navigation,
  Phone,
  AlertTriangle,
  ChevronRight,
  Activity,
  Wifi,
  LocateFixed,
  RefreshCw,
  CheckCircle2,
  BedDouble,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const CHAT_API_URL =
  `${API_BASE}/api/chat`;

const SHELTER_API_URL =
  `${API_BASE}/api/shelters`;

function EmergencyChatbot() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [location, setLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [shelterLoading, setShelterLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text:
        "Hello. I'm HawkVision Emergency AI. I'm ready to assist with disaster response, evacuation guidance, shelter discovery and emergency coordination.",
      time: "Now",
    },
  ]);

  const emergencyActions = [
    {
      icon: MapPin,
      title: "Find nearby shelter",
      subtitle: "Locate safe evacuation centers",
      action: "shelter",
    },
    {
      icon: AlertTriangle,
      title: "Report a disaster",
      subtitle: "Report an active incident",
      action: "chat",
    },
    {
      icon: Phone,
      title: "Emergency contacts",
      subtitle: "View response contacts",
      action: "chat",
    },
    {
      icon: ShieldAlert,
      title: "Send SOS",
      subtitle: "Escalate critical emergency",
      action: "chat",
    },
  ];

  // =========================================================
  // GET USER LOCATION
  // =========================================================

  const getUserLocation = () => {
    return new Promise(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(
            new Error(
              "Geolocation is not supported by this browser."
            )
          );

          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude:
                position.coords.latitude,
              longitude:
                position.coords.longitude,
            };

            setLocation(coords);
            setLocationError("");

            resolve(coords);
          },
          (error) => {
            let errorMessage =
              "Unable to access your location.";

            if (
              error.code ===
              error.PERMISSION_DENIED
            ) {
              errorMessage =
                "Location permission was denied. Please allow location access in your browser.";
            } else if (
              error.code ===
              error.POSITION_UNAVAILABLE
            ) {
              errorMessage =
                "Your current location is unavailable.";
            } else if (
              error.code ===
              error.TIMEOUT
            ) {
              errorMessage =
                "Location request timed out. Please try again.";
            }

            setLocationError(
              errorMessage
            );

            reject(
              new Error(errorMessage)
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      }
    );
  };

  // =========================================================
  // ENABLE LOCATION
  // =========================================================

  const handleEnableLocation =
    async () => {
      if (locationLoading) return;

      try {
        setLocationLoading(true);
        setLocationError("");

        await getUserLocation();

        const botMessage = {
          id:
            Date.now() +
            Math.random(),

          type: "bot",

          text:
            "Your location has been enabled. I can now provide location-aware emergency guidance and find nearby shelters.",

          time: "Now",
        };

        setMessages((prev) => [
          ...prev,
          botMessage,
        ]);
      } catch (error) {
        const botMessage = {
          id:
            Date.now() +
            Math.random(),

          type: "bot",

          text:
            error.message ||
            "I could not access your location. Please enable location permission and try again.",

          time: "Now",

          isError: true,
        };

        setMessages((prev) => [
          ...prev,
          botMessage,
        ]);
      } finally {
        setLocationLoading(false);
      }
    };

  // =========================================================
  // FIND ONLINE SHELTERS / EVACUATION CENTERS
  // =========================================================

  const findOnlineShelters = async (coords, radiusKm = 50) => {
    const radiusMeters = Math.round(radiusKm * 1000);

    const query = `
      [out:json][timeout:20];
      (
        nwr["amenity"="shelter"](around:${radiusMeters},${coords.latitude},${coords.longitude});
        nwr["emergency"="assembly_point"](around:${radiusMeters},${coords.latitude},${coords.longitude});
        nwr["social_facility"="shelter"](around:${radiusMeters},${coords.latitude},${coords.longitude});
        nwr["social_facility"="group_home"](around:${radiusMeters},${coords.latitude},${coords.longitude});
      );
      out center tags;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: query,
      }
    );

    if (!response.ok) {
      throw new Error("Online shelter search is temporarily unavailable.");
    }

    const result = await response.json();

    const toRad = (value) => (value * Math.PI) / 180;

    const distanceKm = (lat1, lon1, lat2, lon2) => {
      const earthRadius = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;

      return (
        earthRadius *
        2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      );
    };

    const seen = new Set();

    return (result.elements || [])
      .map((item) => {
        const lat =
          item.lat ??
          item.center?.lat;

        const lng =
          item.lon ??
          item.center?.lon;

        if (lat == null || lng == null) return null;

        const tags = item.tags || {};

        const name =
          tags.name ||
          tags["name:en"] ||
          tags.operator ||
          tags.description ||
          "Emergency Shelter / Safe Center";

        return {
          id: `osm-${item.type}-${item.id}`,
          name,
          location:
            tags["addr:city"] ||
            tags["addr:street"] ||
            "Nearby location",
          latitude: lat,
          longitude: lng,
          distance: distanceKm(
            coords.latitude,
            coords.longitude,
            lat,
            lng
          ),
          availableBeds: null,
          calculatedStatus: "Location Found",
          source: "Online Map",
        };
      })
      .filter(Boolean)
      .filter((shelter) => {
        if (seen.has(shelter.id)) return false;
        seen.add(shelter.id);
        return true;
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  };

  // =========================================================
  // FIND NEARBY SHELTERS
  // =========================================================

  const findNearbyShelters = async () => {
    if (shelterLoading) return;

    try {
      setShelterLoading(true);
      setLocationError("");

      const userMessage = {
        id: Date.now() + Math.random(),
        type: "user",
        text: "Find nearby shelter",
        time: "Now",
      };

      setMessages((prev) => [...prev, userMessage]);

      // =====================================================
      // 1. AUTOMATICALLY GET CURRENT GPS LOCATION
      // =====================================================

      let userCoords = location;

      if (
        !userCoords ||
        userCoords.latitude == null ||
        userCoords.longitude == null
      ) {
        userCoords = await getUserLocation();
      }

      if (
        !userCoords ||
        userCoords.latitude == null ||
        userCoords.longitude == null
      ) {
        throw new Error(
          "Unable to determine your current GPS location. Please enable location access."
        );
      }

      console.log("📍 HawkVision GPS Location:", userCoords);

      // =====================================================
      // 2. SEARCH HAWKVISION VERIFIED SHELTERS
      //    Automatically expands: 25 -> 50 -> 100 km
      // =====================================================

      let localShelters = [];
      let localSearchRadius = null;

      const searchRadii = [25, 50, 100];

      for (const radius of searchRadii) {
        try {
          console.log(
            `🔎 Searching HawkVision shelters within ${radius} km...`
          );

          const params = new URLSearchParams({
            lat: String(userCoords.latitude),
            lng: String(userCoords.longitude),
            radius: String(radius),
          });

          const response = await fetch(
            `${SHELTER_API_URL}/nearby?${params.toString()}`
          );

          const result = await response.json();

          if (response.ok && result.success) {
            const shelters = Array.isArray(result.data)
              ? result.data
              : [];

            localShelters = shelters
              .filter(
                (shelter) =>
                  shelter.calculatedStatus !== "Closed" &&
                  shelter.calculatedStatus !== "Full" &&
                  Number(shelter.availableBeds) > 0
              )
              .sort(
                (a, b) =>
                  Number(a.distance ?? a.distanceKm ?? 999999) -
                  Number(b.distance ?? b.distanceKm ?? 999999)
              )
              .slice(0, 5)
              .map((shelter) => ({
                ...shelter,
                distance: Number(
                  shelter.distance ?? shelter.distanceKm ?? 0
                ),
                source: "HawkVision Verified",
              }));
          }

          if (localShelters.length > 0) {
            localSearchRadius = radius;
            console.log(
              `✅ Found ${localShelters.length} verified shelter(s) within ${radius} km.`
            );
            break;
          }
        } catch (localError) {
          console.warn(
            `HawkVision shelter search failed at ${radius} km:`,
            localError
          );
        }
      }

      // =====================================================
      // 3. IF VERIFIED SHELTERS ARE NOT FOUND,
      //    SEARCH ONLINE MAP DATA AUTOMATICALLY
      // =====================================================

      let onlineShelters = [];
      let onlineSearchRadius = null;

      if (localShelters.length === 0) {
        const onlineRadii = [25, 50, 100];

        for (const radius of onlineRadii) {
          try {
            console.log(
              `🌐 Searching online map data within ${radius} km...`
            );

            onlineShelters = await findOnlineShelters(
              userCoords,
              radius
            );

            if (onlineShelters.length > 0) {
              onlineSearchRadius = radius;
              console.log(
                `✅ Found ${onlineShelters.length} mapped shelter/safe-center location(s).`
              );
              break;
            }
          } catch (onlineError) {
            console.warn(
              `Online shelter search failed at ${radius} km:`,
              onlineError
            );
          }
        }
      }

      // =====================================================
      // 4. NOTHING FOUND
      // =====================================================

      if (
        localShelters.length === 0 &&
        onlineShelters.length === 0
      ) {
        const botMessage = {
          id: Date.now() + Math.random(),
          type: "bot",
          text:
            "I detected your current GPS location and automatically searched the HawkVision shelter network and mapped evacuation centers up to 100 km away, but no suitable location was found. Please use SOS for a critical emergency.",
          time: "Now",
          isError: true,
        };

        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      // =====================================================
      // 5. HAWKVISION VERIFIED SHELTERS FOUND
      // =====================================================

      if (localShelters.length > 0) {
        const shelterText = localShelters
          .map((shelter, index) => {
            const distance = Number(
              shelter.distance ?? shelter.distanceKm ?? 0
            );

            return `${index + 1}. ${shelter.name} — ${distance.toFixed(
              1
            )} km away — ${
              shelter.availableBeds
            } beds available — ${
              shelter.calculatedStatus || shelter.status || "Available"
            }`;
          })
          .join("\n");

        const botMessage = {
          id: Date.now() + Math.random(),
          type: "bot",
          text:
            `📍 I detected your current GPS location and automatically found ${localShelters.length} verified nearby shelter option${
              localShelters.length > 1 ? "s" : ""
            } within ${localSearchRadius} km:\n\n${shelterText}\n\nThese shelters are from the HawkVision verified shelter network and were selected according to your current GPS position.`,
          time: "Now",
        };

        setMessages((prev) => [...prev, botMessage]);
        return;
      }

      // =====================================================
      // 6. ONLINE MAP LOCATIONS FOUND
      // =====================================================

      const onlineText = onlineShelters
        .map((shelter, index) => {
          const distance = Number(shelter.distance ?? 0);

          return `${index + 1}. ${shelter.name} — ${distance.toFixed(
            1
          )} km away — map-listed location`;
        })
        .join("\n");

      const botMessage = {
        id: Date.now() + Math.random(),
        type: "bot",
        text:
          `📍 I detected your current GPS location and automatically searched online map data. I found ${onlineShelters.length} nearby shelter/safe-center location${
            onlineShelters.length > 1 ? "s" : ""
          } within ${onlineSearchRadius} km:\n\n${onlineText}\n\n⚠️ These locations come from public map data. Live bed availability is not provided, so availability should be verified before travelling.`,
        time: "Now",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Nearby shelter error:", error);

      const botMessage = {
        id: Date.now() + Math.random(),
        type: "bot",
        text:
          error.message ||
          "I couldn't search for nearby shelters right now. Please make sure location access is enabled or use SOS for a critical emergency.",
        time: "Now",
        isError: true,
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setShelterLoading(false);
    }
  };

  // =========================================================
  // FETCH CHATBOT REPLY
  // =========================================================

  const fetchChatReply = async (
    text,
    conversation
  ) => {
    const response =
      await fetch(
        CHAT_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: text,
            conversation,
          }),
        }
      );

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`
      );
    }

    const result =
      await response.json();

    if (
      !result.success ||
      !result.data
    ) {
      throw new Error(
        "Invalid response from the chatbot service"
      );
    }

    return result.data.reply;
  };

  // =========================================================
  // SEND NORMAL CHAT MESSAGE
  // =========================================================

  const handleSend = async (
    customMessage = null
  ) => {
    const text =
      customMessage ||
      message.trim();

    if (
      !text ||
      isTyping ||
      shelterLoading
    ) {
      return;
    }

    const conversation =
      messages
        .filter(
          (entry) =>
            entry.id !== 1 &&
            !entry.isError
        )
        .slice(-10)
        .map(
          ({
            type,
            text: historyText,
          }) => ({
            type,
            text: historyText,
          })
        );

    const userMessage = {
      id:
        Date.now() +
        Math.random(),

      type: "user",

      text,

      time: "Now",
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setMessage("");
    setIsTyping(true);

    try {
      const reply =
        await fetchChatReply(
          text,
          conversation
        );

      const botMessage = {
        id:
          Date.now() +
          Math.random(),

        type: "bot",

        text: reply,

        time: "Now",
      };

      setMessages((prev) => [
        ...prev,
        botMessage,
      ]);
    } catch (error) {
      console.error(
        "Chatbot error:",
        error
      );

      const errorMessage = {
        id:
          Date.now() +
          Math.random(),

        type: "bot",

        text:
          "Connection error: HawkVision AI is unavailable right now. Please check that the backend is running and try again.",

        time: "Now",

        isError: true,
      };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // =========================================================
  // EMERGENCY ACTION HANDLER
  // =========================================================

  const handleEmergencyAction =
    async (action) => {
      if (
        action.action ===
        "shelter"
      ) {
        await findNearbyShelters();
        return;
      }

      await handleSend(
        action.title
      );
    };

  // =========================================================
  // SHARE LOCATION FROM COMPOSER
  // =========================================================

  const handleShareLocation =
    async () => {
      if (locationLoading) return;

      try {
        setLocationLoading(true);
        setLocationError("");

        const coords =
          await getUserLocation();

        const locationMessage = {
          id:
            Date.now() +
            Math.random(),

          type: "user",

          text:
            "Share my current location",

          time: "Now",
        };

        const botMessage = {
          id:
            Date.now() +
            Math.random(),

          type: "bot",

          text:
            `Location shared successfully.\n\nLatitude: ${coords.latitude.toFixed(
              5
            )}\nLongitude: ${coords.longitude.toFixed(
              5
            )}\n\nI can now use your location for emergency assistance and nearby shelter discovery.`,

          time: "Now",
        };

        setMessages((prev) => [
          ...prev,
          locationMessage,
          botMessage,
        ]);
      } catch (error) {
        const errorMessage = {
          id:
            Date.now() +
            Math.random(),

          type: "bot",

          text:
            error.message ||
            "Unable to access your location.",

          time: "Now",

          isError: true,
        };

        setMessages((prev) => [
          ...prev,
          errorMessage,
        ]);
      } finally {
        setLocationLoading(false);
      }
    };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div className="flex items-end justify-between">

        <div>

          <div className="flex items-center gap-2 mb-2">

            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.8)]" />

            <p className="text-[10px] tracking-[0.2em] font-semibold text-[#22C55E]">
              AI SYSTEM ONLINE
            </p>

          </div>

          <h1 className="text-3xl font-bold text-[#F8FAFC]">
            Emergency Chatbot
          </h1>

          <p className="text-sm text-[#8FA4C7] mt-2">
            AI-powered emergency guidance and disaster response coordination.
          </p>

        </div>

        {/* RESPONSE SYSTEM */}

        <div className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0B1425] border border-[#1D304D]">

          <Activity
            size={15}
            className="text-[#22C55E]"
          />

          <div>

            <p className="text-[9px] uppercase tracking-wider text-[#64748B]">
              Response System
            </p>

            <div className="flex items-center gap-1.5 mt-0.5">

              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />

              <span className="text-[11px] text-[#22C55E] font-medium">
                Active
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* LOCATION ERROR */}

      {locationError && (

        <div className="p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center gap-3">

          <MapPin
            size={15}
            className="text-[#F59E0B]"
          />

          <p className="text-xs text-[#8FA4C7]">
            {locationError}
          </p>

        </div>

      )}


      {/* MAIN GRID */}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-5">

        {/* CHAT PANEL */}

        <div className="min-w-0">

          <div className="h-[650px] bg-[#0B1425] border border-[#1D304D] rounded-2xl overflow-hidden flex flex-col">

            {/* CHAT HEADER */}

            <div className="h-[68px] shrink-0 px-5 border-b border-[#1D304D] flex items-center justify-between bg-[#0D172A]">

              <div className="flex items-center gap-3">

                <div className="relative w-10 h-10 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/30 flex items-center justify-center">

                  <Bot
                    size={19}
                    className="text-[#EF3340]"
                  />

                  <span className="absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full bg-[#22C55E] border-2 border-[#0D172A]" />

                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-sm font-semibold text-[#F8FAFC]">
                      HawkVision Emergency AI
                    </h2>

                    <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-[#EF3340]/10 text-[#EF3340] border border-[#EF3340]/20">
                      AI
                    </span>

                  </div>

                  <div className="flex items-center gap-2 mt-1">

                    <span className="text-[10px] text-[#22C55E]">
                      Online
                    </span>

                    <span className="text-[#334155]">
                      •
                    </span>

                    <span className="text-[10px] text-[#64748B]">
                      Emergency response assistant
                    </span>

                  </div>

                </div>

              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EF3340]/5 border border-[#EF3340]/20">

                <Zap
                  size={13}
                  className="text-[#EF3340]"
                />

                <span className="text-[9px] uppercase tracking-wider text-[#EF3340] font-medium">
                  Intelligent Response
                </span>

              </div>

            </div>


            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {messages.map(
                (msg) => {

                  const isUser =
                    msg.type ===
                    "user";

                  return (

                    <div
                      key={msg.id}
                      className={`flex ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`flex gap-3 max-w-[85%] ${
                          isUser
                            ? "flex-row-reverse"
                            : ""
                        }`}
                      >

                        {/* AVATAR */}

                        <div
                          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
                            isUser
                              ? "bg-[#243A59] border-[#315074]"
                              : "bg-[#EF3340]/10 border-[#EF3340]/25"
                          }`}
                        >

                          {isUser ? (

                            <span className="text-[9px] text-[#AFC1DC] font-semibold">
                              YOU
                            </span>

                          ) : (

                            <Bot
                              size={15}
                              className="text-[#EF3340]"
                            />

                          )}

                        </div>


                        {/* MESSAGE */}

                        <div className="min-w-0">

                          <div
                            className={`px-4 py-3 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                              isUser
                                ? "bg-[#EF3340] text-white rounded-tr-sm"
                                : "bg-[#16243A] text-[#D8E2F0] border border-[#243A59] rounded-tl-sm"
                            } ${
                              msg.isError
                                ? "border-[#EF3340]/30 text-[#FF9BA2]"
                                : ""
                            }`}
                          >
                            {msg.text}
                          </div>

                          <p
                            className={`text-[9px] text-[#526783] mt-1.5 ${
                              isUser
                                ? "text-right"
                                : ""
                            }`}
                          >
                            ◷ {msg.time}
                          </p>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}


              {/* SHELTER LOADING */}

              {shelterLoading && (

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/25 flex items-center justify-center">

                    <MapPin
                      size={15}
                      className="text-[#3B82F6]"
                    />

                  </div>

                  <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-[#16243A] border border-[#243A59]">

                    <div className="flex items-center gap-2">

                      <RefreshCw
                        size={13}
                        className="text-[#3B82F6] animate-spin"
                      />

                      <span className="text-[10px] text-[#8FA4C7]">
                        Finding nearby shelters...
                      </span>

                    </div>

                  </div>

                </div>

              )}


              {/* TYPING INDICATOR */}

              {isTyping && (

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/25 flex items-center justify-center">

                    <Bot
                      size={15}
                      className="text-[#EF3340]"
                    />

                  </div>

                  <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-[#16243A] border border-[#243A59]">

                    <div className="flex gap-1">

                      <span className="w-1.5 h-1.5 rounded-full bg-[#7186A8] animate-bounce" />

                      <span className="w-1.5 h-1.5 rounded-full bg-[#7186A8] animate-bounce [animation-delay:150ms]" />

                      <span className="w-1.5 h-1.5 rounded-full bg-[#7186A8] animate-bounce [animation-delay:300ms]" />

                    </div>

                  </div>

                </div>

              )}

            </div>


            {/* CHAT COMPOSER */}

            <div className="shrink-0 p-4 border-t border-[#1D304D] bg-[#0A1324]">

              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#080F1D] border border-[#243A59] focus-within:border-[#36557A] transition-colors">

                {/* ATTACHMENT */}

                <button
                  type="button"
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#AFC1DC] hover:bg-[#16243A] transition-all"
                  title="Attach"
                >
                  <Paperclip
                    size={16}
                  />
                </button>


                {/* LOCATION */}

                <button
                  type="button"
                  onClick={
                    handleShareLocation
                  }
                  disabled={
                    locationLoading
                  }
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#22C55E] hover:bg-[#16243A] transition-all disabled:opacity-50"
                  title="Share location"
                >

                  {locationLoading ? (

                    <RefreshCw
                      size={16}
                      className="animate-spin text-[#22C55E]"
                    />

                  ) : (

                    <LocateFixed
                      size={16}
                    />

                  )}

                </button>


                {/* INPUT */}

                <input
                  type="text"
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {

                    if (
                      e.key ===
                      "Enter"
                    ) {
                      handleSend();
                    }

                  }}
                  placeholder="Describe your emergency..."
                  className="flex-1 min-w-0 bg-transparent outline-none border-none text-xs text-[#E2E8F0] placeholder:text-[#526783] px-2"
                />


                {/* SEND */}

                <button
                  type="button"
                  onClick={() =>
                    handleSend()
                  }
                  disabled={
                    isTyping ||
                    shelterLoading
                  }
                  className="w-10 h-10 shrink-0 rounded-lg bg-[#EF3340] hover:bg-[#D92D39] disabled:opacity-50 flex items-center justify-center text-white shadow-[0_0_18px_rgba(239,51,64,0.15)] transition-all"
                  title="Send"
                >

                  <Send
                    size={16}
                  />

                </button>

              </div>


              <div className="flex items-center justify-between px-1 mt-2">

                <span className="text-[9px] text-[#526783]">
                  Press Enter to send
                </span>

                <div className="flex items-center gap-1.5">

                  <Zap
                    size={10}
                    className="text-[#526783]"
                  />

                  <span className="text-[9px] text-[#526783]">
                    AI-generated emergency guidance
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* RIGHT PANEL */}

        <div className="space-y-4">

          {/* EMERGENCY ACTIONS */}

          <div className="bg-[#0B1425] border border-[#1D304D] rounded-2xl p-4">

            <div className="flex items-center justify-between mb-4">

              <div>

                <h2 className="text-sm font-semibold text-[#F8FAFC]">
                  Emergency Actions
                </h2>

                <p className="text-[9px] text-[#64748B] mt-1">
                  Instant response commands
                </p>

              </div>

              <div className="w-7 h-7 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/20 flex items-center justify-center">

                <ShieldAlert
                  size={13}
                  className="text-[#EF3340]"
                />

              </div>

            </div>


            <div className="space-y-2">

              {emergencyActions.map(
                (action, index) => {

                  const Icon =
                    action.icon;

                  const isShelter =
                    action.action ===
                    "shelter";

                  return (

                    <button
                      key={index}
                      onClick={() =>
                        handleEmergencyAction(
                          action
                        )
                      }
                      disabled={
                        isTyping ||
                        shelterLoading
                      }
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#080F1D] border border-[#1D304D] hover:border-[#315074] hover:bg-[#101C30] transition-all text-left group disabled:opacity-50"
                    >

                      <div className="w-8 h-8 shrink-0 rounded-lg bg-[#16243A] border border-[#243A59] flex items-center justify-center">

                        {isShelter &&
                        shelterLoading ? (

                          <RefreshCw
                            size={14}
                            className="text-[#3B82F6] animate-spin"
                          />

                        ) : (

                          <Icon
                            size={14}
                            className={
                              action.title ===
                              "Send SOS"
                                ? "text-[#EF3340]"
                                : "text-[#7EA5D8]"
                            }
                          />

                        )}

                      </div>


                      <div className="flex-1 min-w-0">

                        <p className="text-[10px] font-medium text-[#E2E8F0]">
                          {action.title}
                        </p>

                        <p className="text-[8px] text-[#526783] mt-0.5">
                          {action.subtitle}
                        </p>

                      </div>


                      <ChevronRight
                        size={13}
                        className="text-[#3D526F] group-hover:text-[#8FA4C7] transition-colors"
                      />

                    </button>

                  );
                }
              )}

            </div>

          </div>


          {/* AI SYSTEM STATUS */}

          <div className="bg-[#0B1425] border border-[#1D304D] rounded-2xl p-4">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-sm font-semibold text-[#F8FAFC]">
                AI System Status
              </h2>

              <Wifi
                size={13}
                className="text-[#22C55E]"
              />

            </div>


            <div className="space-y-3">

              <div className="flex items-center justify-between">

                <span className="text-[10px] text-[#7186A8]">
                  AI Engine
                </span>

                <span className="flex items-center gap-1.5 text-[9px] text-[#22C55E]">

                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />

                  Operational

                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-[10px] text-[#7186A8]">
                  Response Network
                </span>

                <span className="text-[9px] text-[#22C55E]">
                  Connected
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-[10px] text-[#7186A8]">
                  Location Services
                </span>

                <span
                  className={`text-[9px] ${
                    location
                      ? "text-[#22C55E]"
                      : "text-[#F59E0B]"
                  }`}
                >
                  {location
                    ? "Enabled"
                    : "Awaiting"}
                </span>

              </div>

            </div>

          </div>


          {/* LOCATION ASSISTANCE */}

          <div className="bg-[#0B1425] border border-[#1D304D] rounded-2xl p-4">

            <div className="flex items-center gap-3 mb-3">

              <div className="w-8 h-8 rounded-lg bg-[#16243A] border border-[#243A59] flex items-center justify-center">

                <Navigation
                  size={14}
                  className="text-[#3B82F6]"
                />

              </div>

              <div>

                <h2 className="text-xs font-semibold text-[#F8FAFC]">
                  Location Assistance
                </h2>

                <p className="text-[8px] text-[#526783] mt-0.5">
                  Enable location for precise guidance
                </p>

              </div>

            </div>


            <button
              onClick={
                handleEnableLocation
              }
              disabled={
                locationLoading
              }
              className="w-full h-8 rounded-lg border border-[#243A59] text-[9px] text-[#8FA4C7] hover:bg-[#16243A] hover:text-[#F8FAFC] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >

              {locationLoading ? (

                <>
                  <RefreshCw
                    size={12}
                    className="animate-spin"
                  />

                  Getting Location...

                </>

              ) : location ? (

                <>
                  <CheckCircle2
                    size={12}
                    className="text-[#22C55E]"
                  />

                  Location Enabled

                </>

              ) : (

                "Enable Location"

              )}

            </button>

          </div>


          {/* CRITICAL EMERGENCY */}

          <div className="bg-[#1A101A] border border-[#6B2534] rounded-2xl p-4">

            <div className="flex items-center gap-2">

              <AlertTriangle
                size={13}
                className="text-[#EF3340]"
              />

              <h2 className="text-xs font-semibold text-[#F8FAFC]">
                Critical Emergency
              </h2>

            </div>


            <p className="text-[9px] leading-relaxed text-[#7186A8] mt-2">
              For life-threatening situations, use SOS to escalate the incident to the emergency response network.
            </p>


            <button
              type="button"
              onClick={() =>
                handleSend(
                  "I have a critical emergency and need SOS assistance."
                )
              }
              disabled={isTyping}
              className="w-full h-8 mt-3 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/40 text-[9px] text-[#EF5965] hover:bg-[#EF3340]/20 transition-all disabled:opacity-50"
            >
              Open SOS Control
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default EmergencyChatbot;