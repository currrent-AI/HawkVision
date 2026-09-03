const express = require("express");
const Sos = require("../models/sos");

const router = express.Router();

// GET all SOS signals
router.get("/", async (req, res) => {
  try {
    const signals = await Sos.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: signals.length,
      data: signals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch SOS signals",
      error: error.message,
    });
  }
});

// GET a single SOS signal by ID
router.get("/:id", async (req, res) => {
  try {
    const signal = await Sos.findById(req.params.id);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "SOS signal not found",
      });
    }

    res.status(200).json({
      success: true,
      data: signal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch SOS signal",
      error: error.message,
    });
  }
});

// CREATE an SOS signal
router.post("/", async (req, res) => {
  try {
    const signal = await Sos.create(req.body);

    res.status(201).json({
      success: true,
      message: "SOS signal created successfully",
      data: signal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create SOS signal",
      error: error.message,
    });
  }
});

// UPDATE an SOS signal by ID
router.put("/:id", async (req, res) => {
  try {
    const signal = await Sos.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "SOS signal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SOS signal updated successfully",
      data: signal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update SOS signal",
      error: error.message,
    });
  }
});

// DELETE an SOS signal by ID
router.delete("/:id", async (req, res) => {
  try {
    const signal = await Sos.findByIdAndDelete(req.params.id);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "SOS signal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SOS signal deleted successfully",
      data: signal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete SOS signal",
      error: error.message,
    });
  }
});

module.exports = router;
