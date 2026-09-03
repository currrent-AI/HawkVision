const express = require("express");
const Shelter = require("../models/shelter");

const router = express.Router();

// GET all shelters
router.get("/", async (req, res) => {
  try {
    const shelters = await Shelter.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shelters.length,
      data: shelters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch shelters",
      error: error.message,
    });
  }
});

// GET a single shelter by ID
router.get("/:id", async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "Shelter not found",
      });
    }

    res.status(200).json({
      success: true,
      data: shelter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch shelter",
      error: error.message,
    });
  }
});

// CREATE a shelter
router.post("/", async (req, res) => {
  try {
    const shelter = await Shelter.create(req.body);

    res.status(201).json({
      success: true,
      message: "Shelter created successfully",
      data: shelter,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create shelter",
      error: error.message,
    });
  }
});

// UPDATE a shelter by ID
router.put("/:id", async (req, res) => {
  try {
    const shelter = await Shelter.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "Shelter not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shelter updated successfully",
      data: shelter,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update shelter",
      error: error.message,
    });
  }
});

// DELETE a shelter by ID
router.delete("/:id", async (req, res) => {
  try {
    const shelter = await Shelter.findByIdAndDelete(req.params.id);

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "Shelter not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shelter deleted successfully",
      data: shelter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete shelter",
      error: error.message,
    });
  }
});

module.exports = router;
