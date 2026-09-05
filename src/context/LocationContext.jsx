import { createContext, useCallback, useContext, useState } from "react";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Location services are not supported by this browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (positionError) => {
        const messages = {
          1: "Location permission was not granted. Showing the default area instead.",
          2: "Your location is unavailable. Showing the default area instead.",
          3: "Location request timed out. Showing the default area instead.",
        };

        setError(
          messages[positionError.code] ||
            "Unable to determine your location. Showing the default area instead."
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000,
      }
    );
  }, []);

  return (
    <LocationContext.Provider
      value={{ coordinates, loading, error, requestLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- Provider and hook share this module.
export function useUserLocation() {
  const ctx = useContext(LocationContext);

  if (!ctx) {
    throw new Error("useUserLocation must be used within LocationProvider");
  }

  return ctx;
}
