const environmentalData = {
  // Demo/fallback water-level data
  Lahore: {
    waterLevel: 64,
  },

  Swat: {
    waterLevel: 71,
  },

  Islamabad: {
    waterLevel: 42,
  },

  Rawalpindi: {
    waterLevel: 48,
  },

  Murree: {
    waterLevel: 58,
  },

  Peshawar: {
    waterLevel: 67,
  },

  Karachi: {
    waterLevel: 31,
  },
};

// Coordinates for supported locations
const locationCoordinates = {
  Lahore: {
    lat: 31.5204,
    lon: 74.3587,
  },

  Swat: {
    lat: 35.2227,
    lon: 72.4258,
  },

  Islamabad: {
    lat: 33.6844,
    lon: 73.0479,
  },

  Rawalpindi: {
    lat: 33.5651,
    lon: 73.0169,
  },

  Murree: {
    lat: 33.9073,
    lon: 73.3903,
  },

  Peshawar: {
    lat: 34.0151,
    lon: 71.5249,
  },

  Karachi: {
    lat: 24.8607,
    lon: 67.0011,
  },
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


  /*
    Get current weather from OpenWeather
  */

  const weatherUrl =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${coordinates.lat}` +
    `&lon=${coordinates.lon}` +
    `&appid=${process.env.OPENWEATHER_API_KEY}` +
    `&units=metric`;


  const response = await fetch(weatherUrl);


  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenWeather API error: ${errorText}`
    );
  }


  const weather = await response.json();


  /*
    Extract rainfall

    OpenWeather may provide rain data
    for the last 1 hour or 3 hours.

    We use the available value.
  */

  let rainfall = 0;

  if (weather.rain?.["1h"] !== undefined) {
    rainfall = weather.rain["1h"];

  } else if (weather.rain?.["3h"] !== undefined) {
    rainfall = weather.rain["3h"] / 3;
  }


  return {
    location: normalizedLocation,

    rainfall: Number(rainfall.toFixed(2)),

    waterLevel: waterData.waterLevel,

    temperature: weather.main?.temp ?? null,

    humidity: weather.main?.humidity ?? null,

    weatherCondition:
      weather.weather?.[0]?.description || "Unknown",

    coordinates: {
      latitude: coordinates.lat,
      longitude: coordinates.lon,
    },

    source: "OpenWeather + Environmental Monitoring Layer",

    weatherSource: "OpenWeather",

    waterLevelSource: "Demo Environmental Layer",

    timestamp: new Date(),
  };
};


module.exports = {
  getEnvironmentalData,
};