const environmentalData = {
  Lahore: { waterLevel: 64 },
  Swat: { waterLevel: 71 },
  Islamabad: { waterLevel: 42 },
  Rawalpindi: { waterLevel: 48 },
  Murree: { waterLevel: 58 },
  Peshawar: { waterLevel: 67 },
  Karachi: { waterLevel: 31 },
};

const locationCoordinates = {
  Lahore: { lat: 31.5204, lon: 74.3587 },
  Swat: { lat: 35.2227, lon: 72.4258 },
  Islamabad: { lat: 33.6844, lon: 73.0479 },
  Rawalpindi: { lat: 33.5651, lon: 73.0169 },
  Murree: { lat: 33.9073, lon: 73.3903 },
  Peshawar: { lat: 34.0151, lon: 71.5249 },
  Karachi: { lat: 24.8607, lon: 67.0011 },
};

const getEnvironmentalData = async (location) => {
  if (!location || typeof location !== "string") {
    throw new Error("Location is required");
  }

  if (!process.env.OPENWEATHER_API_KEY) {
    throw new Error("OPENWEATHER_API_KEY is missing");
  }

  const normalizedLocation = location.trim();

  const waterData = environmentalData[normalizedLocation];
  const coordinates = locationCoordinates[normalizedLocation];

  if (!waterData || !coordinates) {
    throw new Error(
      `Environmental data is not available for ${normalizedLocation}`
    );
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  /*
   * ---------------------------------------------------------
   * 1. CURRENT WEATHER
   * ---------------------------------------------------------
   * Uses OpenWeather Current Weather API.
   *
   * This endpoint is available with the existing API setup
   * and provides:
   * - temperature
   * - humidity
   * - weather condition
   * - current precipitation when available
   */

  const weatherUrl =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${coordinates.lat}` +
    `&lon=${coordinates.lon}` +
    `&appid=${apiKey}` +
    `&units=metric`;

  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    const errorText = await weatherResponse.text();

    throw new Error(
      `OpenWeather current weather error: ${errorText}`
    );
  }

  const weather = await weatherResponse.json();

  /*
   * ---------------------------------------------------------
   * 2. RAINFALL DETECTION
   * ---------------------------------------------------------
   * We intentionally do NOT use OpenWeather One Call 3.0
   * because that endpoint requires a separate subscription.
   *
   * Current Weather API can provide:
   *
   * rain["1h"] = rainfall during the last hour
   * rain["3h"] = rainfall during the last 3 hours
   *
   * For automatic flood monitoring, recent rainfall is more
   * useful than breaking the monitoring system because the
   * daily aggregation endpoint is unavailable.
   */

  let rainfall = 0;
  let rainfallPeriod = "no measurable rainfall";
  let rainfallSource = "OpenWeather Current Weather";

  if (
    weather.rain &&
    typeof weather.rain["1h"] === "number"
  ) {
    rainfall = Number(
      weather.rain["1h"].toFixed(2)
    );

    rainfallPeriod = "last 1 hour";
  } else if (
    weather.rain &&
    typeof weather.rain["3h"] === "number"
  ) {
    rainfall = Number(
      weather.rain["3h"].toFixed(2)
    );

    rainfallPeriod = "last 3 hours";
  }

  /*
   * ---------------------------------------------------------
   * 3. WEATHER CONDITION
   * ---------------------------------------------------------
   */

  const weatherCondition =
    weather.weather?.[0]?.description || "Unknown";

  /*
   * ---------------------------------------------------------
   * 4. RETURN ENVIRONMENTAL DATA
   * ---------------------------------------------------------
   */

  return {
    location: normalizedLocation,

    rainfall,

    rainfallPeriod,

    rainfallSource,

    waterLevel: waterData.waterLevel,

    temperature:
      weather.main?.temp ?? null,

    humidity:
      weather.main?.humidity ?? null,

    weatherCondition,

    coordinates: {
      latitude: coordinates.lat,
      longitude: coordinates.lon,
    },

    source:
      "OpenWeather + Environmental Monitoring Layer",

    weatherSource: "OpenWeather",

    waterLevelSource:
      "Demo Environmental Layer",

    timestamp: new Date(),
  };
};

module.exports = {
  getEnvironmentalData,
};