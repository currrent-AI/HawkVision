import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Waves,
  Bell,
  MapPin,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Shield,
  Activity,
  Radar,
  Eye,
  Brain,
  AlertTriangle,
  Radio,
  Search,
  Zap,
  ChevronRight,
} from "lucide-react";

import hawkvision1 from "../../assets/hawkvision1.svg";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";



function createIncidentIcon(color) {
  return L.divIcon({
    className: "hv-incident-marker",
    html: `
      <div class="hv-incident-pulse" style="--marker-color:${color}"></div>
      <div class="hv-incident-dot" style="background:${color}; box-shadow:0 0 12px ${color}"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function HeroMapController() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function HeroNationalMap() {
  const incidents = [
    { city: "Lahore", position: [31.5204, 74.3587], type: "VICTIM DETECTION", status: "CRITICAL", color: "#EF3340", radius: 12000 },
    { city: "Karachi", position: [24.8607, 67.0011], type: "FLOOD RISK", status: "HIGH", color: "#3B82F6", radius: 18000 },
    { city: "Islamabad", position: [33.6844, 73.0479], type: "MONITORING", status: "ACTIVE", color: "#22C55E", radius: 10000 },
    { city: "Multan", position: [30.1575, 71.5249], type: "FLOOD WARNING", status: "WARNING", color: "#F59E0B", radius: 14000 },
    { city: "Peshawar", position: [34.0151, 71.5249], type: "AI MONITORING", status: "ACTIVE", color: "#3B82F6", radius: 10000 },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#1D304D] bg-[#0B1426] shadow-[0_0_60px_rgba(59,130,246,0.10)]">
      <div className="flex items-center justify-between h-14 px-5 border-b border-[#1D304D] bg-[#080F1E]/90">
        <div className="flex items-center gap-3">
          <span className="text-[#22C55E] text-xs">◉</span>
          <span className="text-[11px] font-bold tracking-[0.18em] text-[#CBD5E1]">NATIONAL DISASTER MONITOR</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[9px] font-bold tracking-[0.14em] text-[#22C55E]">LIVE MONITORING</span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_220px] min-h-[430px]">
        <div className="relative min-h-[430px] overflow-hidden">
          <MapContainer
            center={[30.3753, 69.3451]}
            zoom={5}
            scrollWheelZoom={false}
            zoomControl={false}
            attributionControl
            className="absolute inset-0 w-full h-full hv-hero-leaflet"
          >
            <TileLayer
              attribution="&copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />
            <HeroMapController />
            {incidents.map((item) => (
              <div key={item.city}>
                <Marker position={item.position} icon={createIncidentIcon(item.color)}>
                  <Popup>
                    <div className="hv-map-popup">
                      <strong>{item.city}</strong>
                      <span>{item.type}</span>
                      <b style={{ color: item.color }}>● {item.status}</b>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={item.position}
                  radius={item.radius}
                  pathOptions={{
                    color: item.color,
                    fillColor: item.color,
                    fillOpacity: 0.035,
                    weight: 1,
                    opacity: 0.35,
                  }}
                />
              </div>
            ))}
          </MapContainer>

          <div className="absolute inset-0 z-[400] pointer-events-none">
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
                backgroundSize: "35px 35px",
              }}
            />
            <div className="absolute top-6 left-6 text-[9px] font-mono text-[#64748B]">
              30.3753° N<br />69.3451° E
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl sm:text-3xl font-black tracking-[0.18em] text-[#CBD5E1]/70">PAKISTAN</div>
              <div className="text-[7px] tracking-[0.35em] text-[#3B82F6] font-bold mt-1">NATIONAL GRID</div>
            </div>
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-4">
              <span className="text-[8px] tracking-[0.15em] text-[#64748B]">LIVE AI SURVEILLANCE</span>
              <span className="text-[8px] tracking-[0.15em] text-[#22C55E]">● NETWORK CONNECTED</span>
            </div>
            <div className="hv-map-scan-line" />
          </div>
        </div>

        <div className="border-l border-[#1D304D] bg-[#080F1E]">
          <div className="relative h-[145px] overflow-hidden border-b border-[#1D304D] bg-[#111C31]">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <Waves size={42} className="text-[#3B82F6]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#080F1E] via-transparent to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md border border-[#EF3340]/50 bg-[#080F1E]/85">
              <span className="text-[8px] font-bold tracking-wider text-[#EF3340]">● LIVE DRONE FEED</span>
            </div>
            <div className="absolute bottom-3 left-3">
              <p className="text-[8px] text-[#64748B]">SECTOR 07</p>
              <p className="text-[11px] font-bold text-[#F1F5F9]">FLOOD SURVEILLANCE</p>
            </div>
          </div>

          <div className="p-5 border-b border-[#1D304D]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[8px] font-bold tracking-[0.18em] text-[#64748B]">CURRENT THREAT LEVEL</span>
              <AlertTriangle size={14} className="text-[#EF3340]" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[#EF3340]/60 flex items-center justify-center text-[#EF3340] font-bold text-lg">7</div>
              <div>
                <div className="text-sm font-bold text-[#EF3340]">HIGH</div>
                <div className="text-[8px] text-[#64748B] mt-1">Flood activity detected</div>
              </div>
            </div>
            <div className="mt-5 h-1.5 rounded-full bg-[#1D304D] overflow-hidden">
              <div className="h-full w-[75%] bg-[#EF3340] rounded-full" />
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Waves size={13} className="text-[#3B82F6]" />
              <span className="text-[8px] font-bold tracking-[0.18em] text-[#64748B]">ENVIRONMENT</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-[#1D304D] p-3">
                <p className="text-[7px] text-[#64748B]">RAINFALL</p>
                <p className="text-sm font-bold text-[#F1F5F9] mt-1">HIGH</p>
              </div>
              <div className="rounded-md border border-[#1D304D] p-3">
                <p className="text-[7px] text-[#64748B]">WATER LEVEL</p>
                <p className="text-sm font-bold text-[#F1F5F9] mt-1">RISING</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();

          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));

            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function Landing() {
  const [victims, victimsRef] = useCountUp(1247);
  const [floods, floodsRef] = useCountUp(38);
  const [alerts, alertsRef] = useCountUp(156);
  const [units, unitsRef] = useCountUp(24);

  const [capRef, capVisible] = useReveal();
  const [flowRef, flowVisible] = useReveal();
  const [pkRef, pkVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  const capabilities = [
    {
      icon: Eye,
      title: "Victim Detection",
      text: "AI-powered human detection from images and drone footage for rapid victim identification.",
      accent: "#3B82F6",
    },
    {
      icon: Waves,
      title: "Flood Prediction",
      text: "AI-based flood risk prediction using environmental and location data.",
      accent: "#3B82F6",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      text: "Intelligent alert system for critical disaster situations requiring immediate response.",
      accent: "#EF3340",
    },
    {
      icon: MapPin,
      title: "Shelter Finder",
      text: "Locate nearby safe shelters and relief centers in disaster-affected areas.",
      accent: "#22C55E",
    },
    {
      icon: MessageSquare,
      title: "AI Emergency Assistant",
      text: "Emergency guidance and real-time assistance powered by AI.",
      accent: "#3B82F6",
    },
    {
      icon: ShieldAlert,
      title: "SOS Response",
      text: "Emergency distress signal coordination and rapid response network.",
      accent: "#EF3340",
    },
  ];

  const flowSteps = [
    { icon: Search, label: "DETECT" },
    { icon: Brain, label: "ANALYZE" },
    { icon: Activity, label: "PREDICT" },
    { icon: AlertTriangle, label: "ALERT" },
    { icon: Zap, label: "RESPOND" },
  ];

  return (
    <>
      <style>{`
        @keyframes hv-fade-up { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hv-radar { 0% { transform: scale(1); opacity: .65; } 70% { transform: scale(2.8); opacity: 0; } 100% { transform: scale(2.8); opacity: 0; } }
        @keyframes hv-scan { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: .8; } 50% { opacity: .45; } 90% { opacity: .8; } 100% { transform: translateY(520px); opacity: 0; } }
        .hv-fade-up { animation: hv-fade-up .8s ease-out both; }
        .hv-fade-up-delay-2 { animation-delay: .18s; }
        .hv-hero-leaflet { background: #080F1E !important; }
        .hv-hero-leaflet .leaflet-control-attribution { background: rgba(8,15,30,.8) !important; color: #64748B !important; font-size: 7px; }
        .hv-hero-leaflet .leaflet-control-attribution a { color: #64748B !important; }
        .hv-hero-leaflet .leaflet-popup-content-wrapper, .hv-hero-leaflet .leaflet-popup-tip { background: #0B1426; color: #F1F5F9; border: 1px solid #1D304D; }
        .hv-hero-leaflet .leaflet-popup-content-wrapper { border-radius: 9px; }
        .hv-hero-leaflet .leaflet-popup-content { margin: 10px; }
        .hv-map-popup { min-width: 120px; display: flex; flex-direction: column; gap: 4px; font-family: inherit; }
        .hv-map-popup strong { font-size: 11px; letter-spacing: .1em; }
        .hv-map-popup span { color: #8FA4C7; font-size: 8px; }
        .hv-map-popup b { font-size: 8px; }
        .hv-incident-marker { background: transparent !important; border: 0 !important; }
        .hv-incident-dot { position: absolute; width: 9px; height: 9px; left: 7.5px; top: 7.5px; border-radius: 50%; z-index: 2; }
        .hv-incident-pulse { position: absolute; width: 22px; height: 22px; left: 1px; top: 1px; border-radius: 50%; background: var(--marker-color); opacity: .35; animation: hv-radar 2s ease-out infinite; }
        .hv-map-scan-line { position: absolute; left: 0; right: 0; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(59,130,246,.8), transparent); animation: hv-scan 4s linear infinite; }
        @media (max-width: 1100px) { .hv-hero-leaflet { min-height: 360px !important; } }
        @media (max-width: 700px) { .hv-hero-leaflet { min-height: 300px !important; } }
        @media (max-width: 640px) { .hv-hero-leaflet { min-height: 300px !important; } }
        @media (prefers-reduced-motion: reduce) { .hv-fade-up, .hv-incident-pulse, .hv-map-scan-line { animation: none !important; } }
      `}</style>
    <div className="min-h-screen bg-[#080F1E] text-[#F1F5F9] overflow-x-hidden">
      {/* ============ NAVBAR ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080F1E]/80 backdrop-blur-md border-b border-[#1D304D]/50">
        <div className="max-w-[1500px] mx-auto px-6 xl:px-10 h-16 flex items-center justify-between">
          <img src={hawkvision1} alt="HawkVision AI" className="h-9 w-auto object-contain" />

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-[#8FA4C7] hover:text-[#F1F5F9] transition-colors px-4 py-2"
            >
              LOGIN
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold text-[#080F1E] bg-[#3B82F6] hover:bg-[#2563EB] transition-colors px-5 py-2 rounded-lg"
            >
              SIGN UP
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] xl:w-[1100px] xl:h-[1100px] rounded-full bg-[#3B82F6]/[0.04] blur-[120px] pointer-events-none" />

        <div className="relative max-w-[1500px] mx-auto px-6 xl:px-10 w-full grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          {/* Left content */}
          <div className="hv-fade-up">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <span className="block w-2 h-2 rounded-full bg-[#22C55E]" />
                <span
                  className="absolute inset-0 w-2 h-2 rounded-full bg-[#22C55E]"
                  style={{ animation: "hv-radar 2s ease-out infinite" }}
                />
              </div>
              <span className="text-[10px] tracking-[0.25em] text-[#8FA4C7] font-semibold uppercase">
                HAWKVISION AI
              </span>
            </div>

            {/* Eyebrow */}
            <p className="text-xs tracking-[0.2em] text-[#3B82F6] font-semibold uppercase mb-4">
              AI-Powered Disaster Response
            </p>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-[#F1F5F9]">SEE THE DISASTER.</span>
              <br />
              <span className="text-[#3B82F6]">PREDICT THE RISK.</span>
              <br />
              <span className="text-[#EF3340]">SAVE LIVES.</span>
            </h1>

            {/* Supporting */}
            <p className="text-[#8FA4C7] text-base sm:text-lg xl:text-xl leading-relaxed max-w-lg mb-8">
              An intelligent disaster control and response system that combines
              AI-powered victim detection, flood prediction, emergency
              assistance and real-time alerts.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                to="/login"
                className="group flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm px-7 py-3.5 rounded-lg transition-all shadow-lg shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/40"
              >
                ENTER COMMAND CENTER
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>

              <a
                href="#capabilities"
                className="flex items-center gap-2 border border-[#1D304D] hover:border-[#3B82F6]/50 text-[#8FA4C7] hover:text-[#F1F5F9] font-semibold text-sm px-7 py-3.5 rounded-lg transition-all"
              >
                EXPLORE SYSTEM
                <ChevronRight size={16} />
              </a>
            </div>

            {/* Live status */}
            <div className="flex flex-wrap gap-5">
              {[
                { label: "SYSTEM ONLINE", color: "#22C55E" },
                { label: "AI ENGINE ACTIVE", color: "#3B82F6" },
                { label: "LIVE MONITORING", color: "#22C55E" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                      style={{ backgroundColor: s.color }}
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                  </span>
                  <span className="text-[10px] tracking-[0.15em] text-[#64748B] font-medium">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual - REAL LEAFLET NATIONAL DISASTER MONITOR */}
          <div className="hv-fade-up hv-fade-up-delay-2 relative flex items-center justify-center w-full">
            <HeroNationalMap />
          </div>
        </div>
      </section>

      {/* ============ IMPACT STATS ============ */}
      <section className="relative py-20 border-t border-[#1D304D]/30">
        <div className="max-w-[1500px] mx-auto px-6 xl:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {[
              {
                label: "Victims Detected",
                value: victims,
                ref: victimsRef,
                icon: Users,
                color: "#3B82F6",
              },
              {
                label: "Flood Zones",
                value: floods,
                ref: floodsRef,
                icon: Waves,
                color: "#3B82F6",
              },
              {
                label: "Active Alerts",
                value: alerts,
                ref: alertsRef,
                icon: Bell,
                color: "#EF3340",
              },
              {
                label: "Response Units",
                value: units,
                ref: unitsRef,
                icon: Radio,
                color: "#22C55E",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  ref={stat.ref}
                  className="relative overflow-hidden rounded-xl border border-[#1D304D] bg-[#111C31]/60 p-6 xl:p-8 text-center group hover:border-[#3B82F6]/30 transition-colors"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#080F1E]/50 pointer-events-none" />
                  <Icon
                    size={22}
                    className="mx-auto mb-3"
                    style={{ color: stat.color }}
                  />
                  <p className="text-3xl sm:text-4xl xl:text-5xl font-bold text-[#F1F5F9] mb-1 relative">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#64748B] tracking-wide uppercase relative">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ AI CAPABILITIES ============ */}
      <section
        id="capabilities"
        ref={capRef}
        className="relative py-24 border-t border-[#1D304D]/30"
      >
        <div className="max-w-[1500px] mx-auto px-6 xl:px-10">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.2em] text-[#3B82F6] font-semibold uppercase mb-3">
              SYSTEM MODULES
            </p>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-[#F1F5F9]">
              Powerful AI Capabilities
            </h2>
          </div>

          <div
            className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 ${
              capVisible ? "hv-fade-up" : "opacity-0"
            }`}
          >
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="relative overflow-hidden rounded-xl border border-[#1D304D] bg-[#111C31]/40 p-6 xl:p-8 group hover:border-[#3B82F6]/30 transition-all hover:-translate-y-0.5"
                >
                  {/* Accent glow */}
                  <div
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"
                    style={{ backgroundColor: cap.accent }}
                  />

                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${cap.accent}15` }}
                  >
                    <Icon size={20} style={{ color: cap.accent }} />
                  </div>

                  <h3 className="text-base font-semibold text-[#F1F5F9] mb-2">
                    {cap.title}
                  </h3>

                  <p className="text-sm text-[#8FA4C7] leading-relaxed">
                    {cap.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ RESPONSE FLOW ============ */}
      <section
        ref={flowRef}
        className="relative py-24 border-t border-[#1D304D]/30"
      >
        <div className="max-w-[1500px] mx-auto px-6 xl:px-10">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.2em] text-[#3B82F6] font-semibold uppercase mb-3">
              RESPONSE PIPELINE
            </p>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-[#F1F5F9]">
              How HawkVision Responds
            </h2>
          </div>

          <div
            className={`flex flex-wrap justify-center items-center gap-4 sm:gap-2 ${
              flowVisible ? "hv-fade-up" : "opacity-0"
            }`}
          >
            {flowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-3 px-4 py-5 xl:px-6 xl:py-6 rounded-xl border border-[#1D304D] bg-[#111C31]/40 min-w-[110px] xl:min-w-[130px] hover:border-[#3B82F6]/30 transition-colors">
                    <Icon size={22} className="xl:w-6 xl:h-6 text-[#3B82F6]" />
                    <span className="text-xs font-bold tracking-[0.15em] text-[#F1F5F9]">
                      {step.label}
                    </span>
                  </div>

                  {i < flowSteps.length - 1 && (
                    <ChevronRight
                      size={18}
                      className="text-[#1D304D] hidden sm:block"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ PAKISTAN SECTION ============ */}
      <section
        ref={pkRef}
        className="relative py-24 border-t border-[#1D304D]/30"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#3B82F6]/[0.02] to-transparent pointer-events-none" />

        <div
          className={`relative max-w-[1500px] mx-auto px-6 xl:px-10 ${
            pkVisible ? "hv-fade-up" : "opacity-0"
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={18} className="text-[#22C55E]" />
                <p className="text-xs tracking-[0.2em] text-[#22C55E] font-semibold uppercase">
                  NATIONAL DEFENSE
                </p>
              </div>

              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-[#F1F5F9] mb-6">
                Built for Pakistan
              </h2>

              <p className="text-[#8FA4C7] leading-relaxed mb-6">
                HawkVision AI is designed specifically for Pakistan's disaster
                response infrastructure. From flood-prone river basins to
                earthquake-vulnerable northern regions, the system provides
                real-time monitoring, AI-powered analysis, and faster emergency
                coordination across all provinces.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Radar,
                    text: "Real-time monitoring across all provinces",
                  },
                  {
                    icon: Brain,
                    text: "AI-powered analysis for flood, earthquake and storm events",
                  },
                  {
                    icon: Radio,
                    text: "Faster emergency coordination with national response units",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={15} className="text-[#3B82F6]" />
                      </div>
                      <p className="text-sm text-[#8FA4C7]">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map visualization placeholder */}
            <div className="relative">
              <div className="aspect-square max-w-[400px] lg:max-w-[480px] xl:max-w-[560px] mx-auto rounded-2xl border border-[#1D304D] bg-[#111C31]/30 overflow-hidden relative">
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />

                {/* Radar sweep */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 rounded-full border border-[#3B82F6]/20"
                    style={{ animation: "hv-glow 3s ease-in-out infinite" }}
                  />
                  <div
                    className="absolute w-48 h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full border border-[#3B82F6]/10"
                    style={{ animation: "hv-glow 3s ease-in-out infinite 1s" }}
                  />
                  <div
                    className="absolute w-64 h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full border border-[#3B82F6]/[0.05]"
                    style={{ animation: "hv-glow 3s ease-in-out infinite 2s" }}
                  />
                </div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center">
                    <Radar size={24} className="lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-[#3B82F6]" />
                  </div>
                </div>

                {/* Detection points */}
                {[
                  { top: "25%", left: "35%", color: "#EF3340" },
                  { top: "40%", right: "25%", color: "#22C55E" },
                  { bottom: "30%", left: "45%", color: "#F59E0B" },
                  { top: "55%", left: "20%", color: "#3B82F6" },
                ].map((pt, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      top: pt.top,
                      left: pt.left,
                      right: pt.right,
                      bottom: pt.bottom,
                      backgroundColor: pt.color,
                      boxShadow: `0 0 10px ${pt.color}80`,
                      animation: `hv-glow 2s ease-in-out infinite ${i * 0.4}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section
        ref={ctaRef}
        className="relative py-28 border-t border-[#1D304D]/30"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#3B82F6]/[0.03] to-transparent pointer-events-none" />

        <div
          className={`relative max-w-3xl mx-auto px-6 text-center ${
            ctaVisible ? "hv-fade-up" : "opacity-0"
          }`}
        >
          <p className="text-xs tracking-[0.2em] text-[#EF3340] font-semibold uppercase mb-4">
            READY TO RESPOND?
          </p>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-[#F1F5F9] mb-5">
            Turn Disaster Intelligence
            <br />
            Into Faster Action
          </h2>

          <p className="text-[#8FA4C7] leading-relaxed mb-10">
            Enter HawkVision Command Center and coordinate smarter, faster
            emergency response across Pakistan.
          </p>

          <Link
            to="/login"
            className="group inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm px-8 py-4 rounded-lg transition-all shadow-lg shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/40"
          >
            ENTER COMMAND CENTER
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[#1D304D]/30 py-8">
        <div className="max-w-[1500px] mx-auto px-6 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={hawkvision1} alt="HawkVision AI" className="h-5 w-auto opacity-50" />
          </div>

          <p className="text-[11px] text-[#64748B]">
            &copy; {new Date().getFullYear()} HawkVision AI &mdash; Pakistan
            Disaster Response System
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}

export default Landing;
