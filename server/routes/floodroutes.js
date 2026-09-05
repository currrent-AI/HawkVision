const express = require("express");
const Alert = require("../models/alert");

const {
  analyzeAlertWithAI,
} = require("../services/alertAI");

const {
  createAlert,
} = require("../services/alerts");

const {
  getEnvironmentalData,
} = require("../services/environmentalData");

const router = express.Router();

/*
  Flood recommendations
*/

const recommendations = {
  LOW:
    "Current environmental conditions indicate a low probability of flooding. Continue monitoring weather conditions.",

  MODERATE:
    "Moderate flood conditions detected. Monitor rainfall and water levels closely and remain prepared for possible evacuation.",

  HIGH:
    "Elevated flood conditions detected. Prepare for evacuation and monitor emergency alerts for your area.",

  CRITICAL:
    "Critical flood conditions detected. Move to higher ground immediately and follow official evacuation instructions.",
};


/*
  POST /api/flood/predict

  Automatically gets environmental data,
  calculates flood risk,
  and sends HIGH/CRITICAL events
  to Groq AI for alert generation.
*/

router.post("/predict", async (req, res) => {
  try {
    const { location } = req.body;


    /*
      Validate location
    */

    if (
      !location ||
      typeof location !== "string" ||
      !location.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid flood analysis input",
        error:
          "location is required",
      });
    }


    const normalizedLocation =
      location.trim();


    /*
      Get automatic environmental data

      OpenWeather:
      - rainfall
      - temperature
      - humidity
      - weather condition

      Environmental layer:
      - water level
    */

    const environmentalData =
      await getEnvironmentalData(
        normalizedLocation
      );


    const rainfall =
      environmentalData.rainfall;

    const waterLevel =
      environmentalData.waterLevel;


    /*
      Flood risk calculation

      Rainfall contribution = 40%
      Water level contribution = 60%
    */

    const rainfallScore =
      Math.min(
        rainfall / 200,
        1
      );

    const waterScore =
      Math.min(
        waterLevel / 100,
        1
      );


    /*
      Flood risk weighting
    */

    const riskScore =
      rainfallScore * 40 +
      waterScore * 60;


    /*
      Determine risk level
    */

    let risk;
    let percentage;


    if (riskScore < 30) {
      risk = "LOW";

      percentage = Math.round(
        Math.max(10, riskScore)
      );

    } else if (riskScore < 55) {
      risk = "MODERATE";

      percentage = Math.round(
        riskScore
      );

    } else if (riskScore < 75) {
      risk = "HIGH";

      percentage = Math.round(
        riskScore
      );

    } else {
      risk = "CRITICAL";

      percentage = Math.min(
        99,
        Math.round(riskScore)
      );
    }


    /*
      Default response
    */

    const responseData = {
      location:
        environmentalData.location,

      rainfall,

      waterLevel,

      temperature:
        environmentalData.temperature,

      humidity:
        environmentalData.humidity,

      weatherCondition:
        environmentalData.weatherCondition,

      coordinates:
        environmentalData.coordinates,

      risk,

      percentage,

      recommendation:
        recommendations[risk],

      dataSource:
        environmentalData.source,

      weatherSource:
        environmentalData.weatherSource,

      waterLevelSource:
        environmentalData.waterLevelSource,

      timestamp:
        environmentalData.timestamp,
    };


    /*
      AI ALERT GENERATION

      Groq is only called when
      flood risk is HIGH or CRITICAL.
    */

    if (
      risk === "HIGH" ||
      risk === "CRITICAL"
    ) {
      try {

        console.log(
          `🤖 Sending ${risk} flood event to Groq for ${normalizedLocation}`
        );


        /*
          Send event to Groq
        */

        const aiResult =
          await analyzeAlertWithAI({
            type: "flood",

            location: {
              name:
                environmentalData.location,

              latitude:
                environmentalData.coordinates
                  ?.latitude ?? null,

              longitude:
                environmentalData.coordinates
                  ?.longitude ?? null,
            },

            rainfall,

            waterLevel,

            temperature:
              environmentalData.temperature,

            humidity:
              environmentalData.humidity,

            weatherCondition:
              environmentalData.weatherCondition,

            risk,

            riskScore: Number(
              (
                riskScore / 100
              ).toFixed(2)
            ),

            description:
              `Flood prediction system detected ${risk.toLowerCase()} flood risk.`,
          });


        /*
          ALERT DEDUPLICATION

          Check if an ACTIVE flood alert already
          exists for this location.

          If it exists:
              UPDATE existing alert

          If it does not exist:
              CREATE new alert
        */

        const existingAlert =
          await Alert.findOne({
            "location.name":
              environmentalData.location,

            type: {
              $in: [
                "Flood Warning",
                "Flood",
              ],
            },

            status: "ACTIVE",
          });


        let alert;


        /*
          EXISTING ACTIVE ALERT
        */

        if (existingAlert) {

          alert =
            await Alert.findByIdAndUpdate(
              existingAlert._id,

              {
                type:
                  aiResult.type,

                title:
                  aiResult.title,

                description:
                  aiResult.description,

                severity:
                  aiResult.severity,

                source:
                  "Flood Prediction AI + Groq",

                location: {
                  name:
                    environmentalData.location,

                  latitude:
                    environmentalData.coordinates
                      ?.latitude ?? null,

                  longitude:
                    environmentalData.coordinates
                      ?.longitude ?? null,
                },

                metadata: {
                  rainfall,

                  waterLevel,

                  temperature:
                    environmentalData.temperature,

                  humidity:
                    environmentalData.humidity,

                  weatherCondition:
                    environmentalData.weatherCondition,

                  floodRisk:
                    risk,

                  floodRiskPercentage:
                    percentage,

                  riskScore:
                    aiResult.riskScore,

                  confidence:
                    aiResult.confidence,

                  aiGenerated: true,

                  dataSource:
                    environmentalData.source,

                  weatherSource:
                    environmentalData.weatherSource,

                  waterLevelSource:
                    environmentalData.waterLevelSource,

                  lastAnalyzedAt:
                    new Date(),
                },
              },

              {
                new: true,
                runValidators: true,
              }
            );


          console.log(
            `♻️ Existing flood alert updated for ${environmentalData.location}`
          );


          responseData.aiAlertAction =
            "UPDATED";
        }


        /*
          NO EXISTING ALERT
        */

        else {

          alert =
            await createAlert({
              type:
                aiResult.type,

              title:
                aiResult.title,

              description:
                aiResult.description,

              severity:
                aiResult.severity,

              source:
                "Flood Prediction AI + Groq",

              location: {
                name:
                  environmentalData.location,

                latitude:
                  environmentalData.coordinates
                    ?.latitude ?? null,

                longitude:
                  environmentalData.coordinates
                    ?.longitude ?? null,
              },

              metadata: {
                rainfall,

                waterLevel,

                temperature:
                  environmentalData.temperature,

                humidity:
                  environmentalData.humidity,

                weatherCondition:
                  environmentalData.weatherCondition,

                floodRisk:
                  risk,

                floodRiskPercentage:
                  percentage,

                riskScore:
                  aiResult.riskScore,

                confidence:
                  aiResult.confidence,

                aiGenerated: true,

                dataSource:
                  environmentalData.source,

                weatherSource:
                  environmentalData.weatherSource,

                waterLevelSource:
                  environmentalData.waterLevelSource,
              },
            });


          console.log(
            `🚨 New flood alert created for ${environmentalData.location}`
          );


          responseData.aiAlertAction =
            "CREATED";
        }


        /*
          Return AI alert information
        */

        responseData.aiAlert = {
          id:
            alert._id,

          type:
            alert.type,

          title:
            alert.title,

          severity:
            alert.severity,

          confidence:
            aiResult.confidence,

          action:
            responseData.aiAlertAction,
        };


      } catch (aiError) {

        /*
          Groq failure should NOT break
          the flood prediction itself.
        */

        console.error(
          "Flood AI alert error:",
          aiError.message
        );

        responseData.aiAlert = null;

        responseData.aiAlertError =
          aiError.message;
      }
    }


    /*
      Final response
    */

    return res.status(200).json({
      success: true,

      message:
        "Flood risk analysis completed",

      data:
        responseData,
    });


  } catch (error) {

    console.error(
      "Flood prediction error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to analyze flood risk",

      error:
        error.message,
    });
  }
});


module.exports = router;