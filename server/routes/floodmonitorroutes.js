const express = require("express");

const {
  runFloodMonitoringCycle,
} = require("../services/floodMonitor");

const router = express.Router();

/*
  GET /api/flood/monitor

  Runs the automatic flood monitoring cycle
  and returns the latest environmental/risk
  status for all monitored locations.
*/

router.get("/", async (req, res) => {
  try {
    const monitoringResult =
      await runFloodMonitoringCycle();

    return res.status(200).json({
      success: true,
      message: "Automatic flood monitoring completed",
      data: monitoringResult,
    });
  } catch (error) {
    console.error(
      "Flood monitoring API error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve automatic flood monitoring data",
      error: error.message,
    });
  }
});

module.exports = router;