const express = require("express");
const Disaster = require("../models/disaster");

const router = express.Router();

// GET all disasters
router.get("/", async (req, res) => {
  try {
    const disasters = await Disaster.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: disasters.length,
      data: disasters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch disasters",
      error: error.message,
    });
  }
});

// CREATE a disaster
router.post("/", async (req, res) => {
  try {
    const disaster = await Disaster.create(req.body);

    res.status(201).json({
      success: true,
      message: "Disaster created successfully",
      data: disaster,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create disaster",
      error: error.message,
    });
  }
});

// GET a single disaster by ID
router.get("/:id", async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id);

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found",
      });
    }

    res.status(200).json({
      success: true,
      data: disaster,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch disaster",
      error: error.message,
    });
  }
});

// UPDATE a disaster by ID
router.put("/:id", async (req, res) => {
  try {
    const disaster = await Disaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Disaster updated successfully",
      data: disaster,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update disaster",
      error: error.message,
    });
  }
});

// DELETE a disaster by ID
router.delete("/:id", async (req, res) => {
  try {
    const disaster = await Disaster.findByIdAndDelete(req.params.id);

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Disaster deleted successfully",
      data: disaster,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete disaster",
      error: error.message,
    });
  }
});

module.exports = router;