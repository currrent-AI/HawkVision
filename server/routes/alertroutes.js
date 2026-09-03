const express = require("express");
const Disaster = require("../models/disaster");
const Sos = require("../models/sos");
const Alert = require("../models/alert");
const { buildAlerts, createAlert } = require("../services/alerts");
const { analyzeAlertWithAI } = require("../services/alertAI");

const router = express.Router();

// =====================================================
// GET ALL ALERTS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const [savedAlerts, disasters, sosSignals] =
      await Promise.all([
        Alert.find().sort({ createdAt: -1 }),
        Disaster.find(),
        Sos.find(),
      ]);

    // Disaster + SOS alerts are generated from
    // their own collections, so they are read-only
    // from this Alerts dashboard.
    const existingAlerts = buildAlerts(
      disasters,
      sosSignals
    ).map((alert) => ({
      ...alert,
      isManaged: false,
    }));

    // MongoDB Alert documents can be acknowledged/resolved
    const managedAlerts = savedAlerts.map((alert) => ({
      id: alert._id,
      type: alert.type,
      title: alert.title,
      message: alert.description,
      severity: alert.severity,
      location: alert.location?.name || "",
      latitude:
        alert.location?.latitude ?? null,
      longitude:
        alert.location?.longitude ?? null,
      status: alert.status,
      createdAt: alert.createdAt,
      source: alert.source,
      metadata: alert.metadata,

      // IMPORTANT:
      // These alerts exist inside Alert collection.
      isManaged: true,
    }));

    const alerts = [
      ...managedAlerts,
      ...existingAlerts,
    ];

    alerts.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error(
      "Fetch alerts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
});

// =====================================================
// POST CREATE NORMAL/SYSTEM ALERT
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      severity,
      source,
      location,
      metadata,
    } = req.body;

    if (!type || !title || !severity) {
      return res.status(400).json({
        success: false,
        message:
          "type, title and severity are required",
      });
    }

    const alert = await createAlert({
      type,
      title,
      description,
      severity,
      source,
      location,
      metadata,
    });

    return res.status(201).json({
      success: true,
      message:
        "Alert created successfully",
      data: alert,
    });
  } catch (error) {
    console.error(
      "Create alert error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create alert",
      error: error.message,
    });
  }
});

// =====================================================
// POST GROQ AI ALERT
// =====================================================

router.post("/ai", async (req, res) => {
  try {
    const { event } = req.body;

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "event is required",
      });
    }

    const aiResult =
      await analyzeAlertWithAI(event);

    const alert = await createAlert({
      type: aiResult.type,
      title: aiResult.title,
      description: aiResult.description,
      severity: aiResult.severity,
      source: "Groq Alert AI",
      location: event.location || {},
      metadata: {
        riskScore: aiResult.riskScore,
        confidence: aiResult.confidence,
        aiGenerated: true,
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "AI alert generated successfully",
      data: alert,
      aiAnalysis: aiResult,
    });
  } catch (error) {
    console.error(
      "AI alert error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate AI alert",
      error: error.message,
    });
  }
});

// =====================================================
// PATCH ACKNOWLEDGE ALERT
// =====================================================

router.patch(
  "/:id/acknowledge",
  async (req, res) => {
    try {
      const alert =
        await Alert.findByIdAndUpdate(
          req.params.id,
          {
            status: "ACKNOWLEDGED",
            acknowledgedAt: new Date(),
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!alert) {
        return res.status(404).json({
          success: false,
          message:
            "Managed alert not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Alert acknowledged successfully",
        data: alert,
      });
    } catch (error) {
      console.error(
        "Acknowledge alert error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to acknowledge alert",
        error: error.message,
      });
    }
  }
);

// =====================================================
// PATCH RESOLVE ALERT
// =====================================================

router.patch(
  "/:id/resolve",
  async (req, res) => {
    try {
      const alert =
        await Alert.findByIdAndUpdate(
          req.params.id,
          {
            status: "RESOLVED",
            resolvedAt: new Date(),
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!alert) {
        return res.status(404).json({
          success: false,
          message:
            "Managed alert not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Alert resolved successfully",
        data: alert,
      });
    } catch (error) {
      console.error(
        "Resolve alert error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to resolve alert",
        error: error.message,
      });
    }
  }
);

module.exports = router;