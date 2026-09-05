import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const STATUS_COLORS = {
  Available: "#22C55E",
  Limited: "#F59E0B",
  Full: "#EF3340",
  Closed: "#64748B",
};

function hasCoordinates(item) {
  return (
    Number.isFinite(Number(item?.latitude)) &&
    Number.isFinite(Number(item?.longitude))
  );
}

function createMarkerIcon(color, size = 17) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${color};
        border:2px solid #F8FAFC;
        box-shadow:0 0 12px ${color};
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function UserLocationMarker({ userLocation }) {
  if (!userLocation) return null;

  const position = [
    Number(userLocation.latitude),
    Number(userLocation.longitude),
  ];

  const icon = createMarkerIcon("#3B82F6", 16);

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <strong>Your location</strong>
      </Popup>
    </Marker>
  );
}

function MapViewport({ center, shelters, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const points = shelters
      .filter(hasCoordinates)
      .map((shelter) => [
        Number(shelter.latitude),
        Number(shelter.longitude),
      ]);

    if (userLocation) {
      points.unshift([
        Number(userLocation.latitude),
        Number(userLocation.longitude),
      ]);
    } else if (hasCoordinates(center)) {
      points.unshift([
        Number(center.latitude),
        Number(center.longitude),
      ]);
    }

    if (!points.length) return;

    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 11,
    });
  }, [
    map,
    center,
    shelters,
    userLocation,
  ]);

  return null;
}

function ShelterMarker({
  shelter,
  onNavigate,
  getStatus,
}) {
  const status = getStatus(shelter);

  const color =
    STATUS_COLORS[status] || STATUS_COLORS.Closed;

  const availableBeds =
    Number(shelter.availableBeds) || 0;

  const position = [
    Number(shelter.latitude),
    Number(shelter.longitude),
  ];

  const icon = useMemo(
    () => createMarkerIcon(color, 17),
    [color]
  );

  return (
    <Marker
      position={position}
      icon={icon}
    >
      <Popup>
        <div
          style={{
            minWidth: 190,
            color: "#111827",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong
              style={{
                fontSize: 13,
                display: "block",
              }}
            >
              {shelter.name}
            </strong>

            <span
              style={{
                fontSize: 11,
                color: "#64748B",
              }}
            >
              {shelter.location}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              marginBottom: 6,
            }}
          >
            <span style={{ color }}>
              {status}
            </span>

            <span>
              {availableBeds.toLocaleString()} beds
            </span>
          </div>

          <div
            style={{
              fontSize: 11,
              color: "#64748B",
              marginBottom: 10,
            }}
          >
            {shelter.distance !== null &&
            shelter.distance !== undefined
              ? `${shelter.distance} km away`
              : "Distance unavailable"}
          </div>

          <button
            type="button"
            onClick={() => onNavigate(shelter)}
            disabled={status === "Closed"}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 6,
              background:
                status === "Closed"
                  ? "#94A3B8"
                  : "#EF3340",
              color: "#FFFFFF",
              padding: "7px 10px",
              fontSize: 11,
              fontWeight: 600,
              cursor:
                status === "Closed"
                  ? "not-allowed"
                  : "pointer",
              opacity:
                status === "Closed" ? 0.5 : 1,
            }}
          >
            Get directions
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

function ShelterLeafletMap({
  center,
  shelters,
  userLocation,
  onNavigate,
  getStatus,
}) {
  const mappedShelters = shelters.filter(hasCoordinates);

  const fallbackCenter = hasCoordinates(center)
    ? [
        Number(center.latitude),
        Number(center.longitude),
      ]
    : [31.5204, 74.3587];

  return (
    <MapContainer
      center={fallbackCenter}
      zoom={11}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{
        minHeight: "100%",
        background: "#080F1E",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewport
        center={center}
        shelters={mappedShelters}
        userLocation={userLocation}
      />

      <UserLocationMarker
        userLocation={userLocation}
      />

      {mappedShelters.map((shelter) => (
        <ShelterMarker
          key={shelter._id}
          shelter={shelter}
          onNavigate={onNavigate}
          getStatus={getStatus}
        />
      ))}
    </MapContainer>
  );
}

function ShelterMap({
  center,
  shelters,
  userLocation,
  onNavigate,
  getStatus,
}) {
  return (
    <ShelterLeafletMap
      center={center}
      shelters={shelters}
      userLocation={userLocation}
      onNavigate={onNavigate}
      getStatus={getStatus}
    />
  );
}

export default ShelterMap;