const { getEnvironmentalData } = require("./environmentalData");
const Alert = require("../models/alert");
const { analyzeAlertWithAI } = require("./alertAI");
const { createAlert } = require("./alerts");

/*
 * ============================================================
 * HAWKVISION AI - AUTOMATIC FLOOD MONITORING SERVICE
 * ============================================================
 *
 * This service:
 * 1. Monitors configured Pakistani locations automatically.
 * 2. Gets live environmental/weather data.
 * 3. Calculates flood risk.
 * 4. Sends ONLY HIGH/CRITICAL events to Groq AI.
 * 5. Creates or updates flood alerts in MongoDB.
 *
 * LOW and MODERATE results do NOT create emergency alerts.
 * ============================================================
 */

const MONITORED_LOCATIONS = [
  "Lahore",
  "Swat",
  "Islamabad",
  "Rawalpindi",
  "Murree",
  "Peshawar",
  "Karachi",
];

/*
 * ============================================================
 * FLOOD RISK CALCULATION
 * ============================================================
 *
 * Existing HawkVision risk formula:
 *
 * Rainfall = 40%
 * Water Level = 60%
 *
 * Rainfall is normalized against 200mm.
 * Water level is normalized against 100%.
 */

const calculateFloodRisk = (rainfall, waterLevel) => {
  const safeRainfall =
    typeof rainfall === "number" ? rainfall : 0;

  const safeWaterLevel =
    typeof waterLevel === "number" ? waterLevel : 0;

  const rainfallScore = Math.min(
    safeRainfall / 200,
    1
  );

  const waterScore = Math.min(
    safeWaterLevel / 100,
    1
  );

  const riskScore =
    rainfallScore * 40 +
    waterScore * 60;

  let risk;
  let percentage;

  if (riskScore < 30) {
    risk = "LOW";

    percentage = Math.round(
      Math.max(10, riskScore)
    );
  } else if (riskScore < 55) {
    risk = "MODERATE";

    percentage = Math.round(riskScore);
  } else if (riskScore < 75) {
    risk = "HIGH";

    percentage = Math.round(riskScore);
  } else {
    risk = "CRITICAL";

    percentage = Math.min(
      99,
      Math.round(riskScore)
    );
  }

  return {
    risk,
    percentage,
    riskScore: Number(
      riskScore.toFixed(2)
    ),
  };
};

/*
 * ============================================================
 * CREATE / UPDATE AUTOMATIC FLOOD ALERT
 * ============================================================
 *
 * Only HIGH and CRITICAL risks reach this function.
 */

const processHighRiskAlert = async (monitoringResult) => {
  const {
    location,
    rainfall,
    rainfallPeriod,
    rainfallSource,
    waterLevel,
    waterLevelSource,
    temperature,
    humidity,
    weatherCondition,
    coordinates,
    risk,
    percentage,
    riskScore,
    timestamp,
  } = monitoringResult;

  /*
   * Safety check:
   * LOW and MODERATE must never create emergency alerts.
   */

  if (
    risk !== "HIGH" &&
    risk !== "CRITICAL"
  ) {
    return {
      alertCreated: false,
      alertUpdated: false,
      aiAlert: null,
    };
  }

  console.log(
    `🚨 ${location}: ${risk} flood risk detected (${percentage}%).`
  );

  /*
   * ==========================================================
   * GROQ AI ANALYSIS
   * ==========================================================
   */

  let aiAlert;

  try {
    console.log(
      `🤖 Sending ${location} flood event to Groq AI...`
    );

    aiAlert = await analyzeAlertWithAI({
      type: "Flood Warning",

      location,

      rainfall,

      rainfallPeriod,

      waterLevel,

      temperature,

      humidity,

      weatherCondition,

      risk,

      percentage,

      riskScore,

      coordinates,

      timestamp,
    });

    console.log(
      `✅ Groq AI analysis completed for ${location}.`
    );
  } catch (error) {
    console.error(
      `❌ Groq AI analysis failed for ${location}:`,
      error.message
    );

    /*
     * Do not crash the entire monitoring cycle
     * if Groq temporarily fails.
     */

    return {
      alertCreated: false,
      alertUpdated: false,
      aiAlert: null,
      error: `Groq AI failed: ${error.message}`,
    };
  }

  /*
   * ==========================================================
   * FIND EXISTING ACTIVE FLOOD ALERT
   * ==========================================================
   *
   * This prevents duplicate alerts every 10 minutes.
   */

  let existingAlert = null;

  try {
    existingAlert = await Alert.findOne({
      "location.name": location,

      type: {
        $in: [
          "Flood Warning",
          "Flood",
        ],
      },

      status: "ACTIVE",
    });
  } catch (error) {
    console.error(
      `❌ Failed to check existing alert for ${location}:`,
      error.message
    );

    return {
      alertCreated: false,
      alertUpdated: false,
      aiAlert,
      error: `Alert lookup failed: ${error.message}`,
    };
  }

  /*
   * ==========================================================
   * PREPARE ALERT DATA
   * ==========================================================
   */

  const alertType =
    aiAlert?.type || "Flood Warning";

  const alertTitle =
    aiAlert?.title ||
    `${risk} Flood Warning - ${location}`;

  const alertDescription =
    aiAlert?.description ||
    `${risk} flood risk detected in ${location}.`;

  const alertSeverity =
    aiAlert?.severity === "CRITICAL"
      ? "CRITICAL"
      : aiAlert?.severity === "HIGH"
        ? "HIGH"
        : risk;

  const alertMetadata = {
    automatic: true,

    monitoringSource:
      "Automatic Flood Monitoring",

    aiProvider: "Groq",

    aiModel:
      "openai/gpt-oss-20b",

    risk,

    percentage,

    riskScore,

    rainfall,

    rainfallPeriod,

    rainfallSource,

    waterLevel,

    waterLevelSource,

    temperature,

    humidity,

    weatherCondition,

    aiRiskScore:
      aiAlert?.riskScore ?? null,

    aiConfidence:
      aiAlert?.confidence ?? null,

    lastCheckedAt: timestamp,
  };

  /*
   * ==========================================================
   * UPDATE EXISTING ALERT
   * ==========================================================
   */

  if (existingAlert) {
    existingAlert.type = alertType;

    existingAlert.title = alertTitle;

    existingAlert.description =
      alertDescription;

    existingAlert.severity =
      alertSeverity;

    existingAlert.source =
      "Automatic Flood Monitoring + Groq AI";

    existingAlert.location = {
      name: location,

      latitude:
        coordinates?.latitude ?? null,

      longitude:
        coordinates?.longitude ?? null,
    };

    existingAlert.metadata =
      alertMetadata;

    existingAlert.status = "ACTIVE";

    await existingAlert.save();

    console.log(
      `🔄 Existing flood alert updated for ${location}.`
    );

    return {
      alertCreated: false,

      alertUpdated: true,

      alertId:
        existingAlert._id,

      aiAlert,

      alert: existingAlert,
    };
  }

  /*
   * ==========================================================
   * CREATE NEW ALERT
   * ==========================================================
   */

  const newAlert = await createAlert({
    type: alertType,

    title: alertTitle,

    description:
      alertDescription,

    severity:
      alertSeverity,

    source:
      "Automatic Flood Monitoring + Groq AI",

    location: {
      name: location,

      latitude:
        coordinates?.latitude ?? null,

      longitude:
        coordinates?.longitude ?? null,
    },

    metadata:
      alertMetadata,
  });

  console.log(
    `🚨 New automatic flood alert created for ${location}.`
  );

  return {
    alertCreated: true,

    alertUpdated: false,

    alertId:
      newAlert._id,

    aiAlert,

    alert: newAlert,
  };
};

/*
 * ============================================================
 * MONITOR ONE LOCATION
 * ============================================================
 */

const monitorLocation = async (location) => {
  try {
    /*
     * Get live environmental/weather information.
     */
    const environmentalData =
      await getEnvironmentalData(location);

    /*
     * Calculate HawkVision flood risk.
     */
    const riskResult =
      calculateFloodRisk(
        environmentalData.rainfall,
        environmentalData.waterLevel
      );

    const monitoringResult = {
      success: true,

      location:
        environmentalData.location,

      rainfall:
        environmentalData.rainfall,

      rainfallPeriod:
        environmentalData.rainfallPeriod,

      rainfallSource:
        environmentalData.rainfallSource,

      waterLevel:
        environmentalData.waterLevel,

      waterLevelSource:
        environmentalData.waterLevelSource,

      temperature:
        environmentalData.temperature,

      humidity:
        environmentalData.humidity,

      weatherCondition:
        environmentalData.weatherCondition,

      coordinates:
        environmentalData.coordinates,

      risk:
        riskResult.risk,

      percentage:
        riskResult.percentage,

      riskScore:
        riskResult.riskScore,

      timestamp:
        environmentalData.timestamp,

      source:
        environmentalData.source,

      weatherSource:
        environmentalData.weatherSource,
    };

    /*
     * ========================================================
     * NORMAL CONDITIONS
     * ========================================================
     *
     * LOW / MODERATE:
     * No Groq call.
     * No emergency alert.
     */

    if (
      riskResult.risk === "LOW" ||
      riskResult.risk === "MODERATE"
    ) {
      console.log(
        `✅ ${location}: ${riskResult.risk} (${riskResult.percentage}%) - no emergency alert required.`
      );

      return monitoringResult;
    }

    /*
     * ========================================================
     * HIGH / CRITICAL CONDITIONS
     * ========================================================
     *
     * Send to Groq and create/update MongoDB alert.
     */

    const alertResult =
      await processHighRiskAlert(
        monitoringResult
      );

    return {
      ...monitoringResult,

      alertCreated:
        alertResult.alertCreated,

      alertUpdated:
        alertResult.alertUpdated,

      alertId:
        alertResult.alertId ?? null,

      aiAlert:
        alertResult.aiAlert ?? null,

      alertError:
        alertResult.error ?? null,
    };
  } catch (error) {
    /*
     * One location failure must NOT stop
     * the other locations from being monitored.
     */

    console.error(
      `❌ Flood monitoring failed for ${location}:`,
      error.message
    );

    return {
      success: false,

      location,

      error:
        error.message,

      timestamp:
        new Date(),
    };
  }
};

/*
 * ============================================================
 * RUN COMPLETE MONITORING CYCLE
 * ============================================================
 *
 * Checks all configured locations.
 */

const runFloodMonitoringCycle =
  async () => {
    console.log(
      "\n🌧️ Starting automatic flood monitoring cycle..."
    );

    console.log(
      `📍 Monitoring ${MONITORED_LOCATIONS.length} locations...`
    );

    const results = [];

    /*
     * Sequential processing keeps API usage controlled
     * and makes logs easier to understand.
     */

    for (
      const location
      of MONITORED_LOCATIONS
    ) {
      const result =
        await monitorLocation(
          location
        );

      results.push(result);
    }

    /*
     * Separate successful and failed locations.
     */

    const successfulResults =
      results.filter(
        (result) =>
          result.success
      );

    const failedResults =
      results.filter(
        (result) =>
          !result.success
      );

    /*
     * Find HIGH / CRITICAL locations.
     */

    const highRiskResults =
      successfulResults.filter(
        (result) =>
          result.risk === "HIGH" ||
          result.risk === "CRITICAL"
      );

    /*
     * Find newly created alerts.
     */

    const createdAlerts =
      successfulResults.filter(
        (result) =>
          result.alertCreated === true
      );

    /*
     * Find updated alerts.
     */

    const updatedAlerts =
      successfulResults.filter(
        (result) =>
          result.alertUpdated === true
      );

    /*
     * ========================================================
     * SUMMARY LOG
     * ========================================================
     */

    console.log(
      "\n=========================================="
    );

    console.log(
      "🌧️ Flood monitoring completed"
    );

    console.log(
      `✅ Successful: ${successfulResults.length}/${MONITORED_LOCATIONS.length}`
    );

    console.log(
      `🚨 HIGH/CRITICAL: ${highRiskResults.length}`
    );

    console.log(
      `🆕 New alerts: ${createdAlerts.length}`
    );

    console.log(
      `🔄 Updated alerts: ${updatedAlerts.length}`
    );

    console.log(
      `❌ Failed: ${failedResults.length}`
    );

    if (
      highRiskResults.length > 0
    ) {
      console.log(
        "🚨 High-risk locations:",
        highRiskResults.map(
          (result) =>
            `${result.location} (${result.risk})`
        )
      );
    }

    if (
      failedResults.length > 0
    ) {
      console.warn(
        "⚠️ Failed locations:",
        failedResults.map(
          (result) =>
            result.location
        )
      );
    }

    console.log(
      "==========================================\n"
    );

    /*
     * Return complete cycle result.
     */

    return {
      success: true,

      checkedLocations:
        MONITORED_LOCATIONS.length,

      successfulLocations:
        successfulResults.length,

      failedLocations:
        failedResults.length,

      highRiskLocations:
        highRiskResults.length,

      newAlerts:
        createdAlerts.length,

      updatedAlerts:
        updatedAlerts.length,

      results,

      timestamp:
        new Date(),
    };
  };

/*
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {
  MONITORED_LOCATIONS,

  calculateFloodRisk,

  monitorLocation,

  processHighRiskAlert,

  runFloodMonitoringCycle,
};