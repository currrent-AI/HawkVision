const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const Victim = require("../models/victim");
const { detectVictims } = require("../services/victimDetection");

const router = express.Router();

// ============================================================
// Upload Configuration
// ============================================================

const uploadDir = path.join(__dirname, "../uploads/victims");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const safeName =
      path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .substring(0, 80) || "victim-image";

    cb(
      null,
      `${Date.now()}-${safeName}${extension.toLowerCase()}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, JPEG, PNG and WEBP images are allowed"
        )
      );
    }
  },
});

// ============================================================
// POST /analyze
// AI Victim Detection
// ============================================================

router.post(
  ["/analyze", "/detect"],
  upload.single("image"),
  async (req, res) =>  {
  let uploadedImagePath = null;

  try {
    // --------------------------------------------------------
    // Validate image
    // --------------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a disaster image",
      });
    }

    uploadedImagePath = req.file.path;

    // --------------------------------------------------------
    // Location
    // --------------------------------------------------------

    const location =
      typeof req.body.location === "string" &&
      req.body.location.trim() !== ""
        ? req.body.location.trim()
        : "Unknown";

    // --------------------------------------------------------
    // Run YOLO Victim Detection
    // --------------------------------------------------------

    console.log(
      `🔎 Starting victim detection for: ${req.file.originalname}`
    );

    const detectionResult = await detectVictims(uploadedImagePath);

    const detections = Array.isArray(detectionResult.detections)
      ? detectionResult.detections
      : [];

    const totalVictims = Number(
      detectionResult.totalVictims || detections.length
    );

    // --------------------------------------------------------
    // Risk Classification
    //
    // High    >= 0.75
    // Medium  >= 0.50
    // Low     < 0.50
    // --------------------------------------------------------

    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;

    detections.forEach((detection) => {
      const confidence = Number(detection.confidence || 0);

      if (confidence >= 0.75) {
        highRisk++;
      } else if (confidence >= 0.50) {
        mediumRisk++;
      } else {
        lowRisk++;
      }
    });

    // --------------------------------------------------------
    // Save Analysis to MongoDB
    // --------------------------------------------------------

    const victim = await Victim.create({
      imageName: req.file.originalname,
      location,
      totalVictims,
      highRisk,
      mediumRisk,
      lowRisk,
    });

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    console.log(
      `✅ Victim detection completed: ${totalVictims} victims | high: ${highRisk} | medium: ${mediumRisk} | low: ${lowRisk} | avg confidence: ${
        detectionResult.averageConfidence ?? "n/a"
      } | slices: ${detectionResult.slicesProcessed ?? 0}`
    );

    return res.status(201).json({
      success: true,

      message: "AI victim detection completed successfully",

      data: {
        id: victim._id,

        imageName: victim.imageName,

        location: victim.location,

        totalVictims,

        riskSummary: {
          highRisk,
          mediumRisk,
          lowRisk,
        },

        detections,

        createdAt: victim.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Victim detection error:", error);

    // Delete uploaded image if processing failed
    if (uploadedImagePath && fs.existsSync(uploadedImagePath)) {
      try {
        fs.unlinkSync(uploadedImagePath);
      } catch (deleteError) {
        console.error(
          "Could not delete failed upload:",
          deleteError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Victim detection failed",
      error: error.message,
    });
  }
});

// ============================================================
// GET /
// Get all victim detection records
// ============================================================

router.get("/", async (req, res) => {
  try {
    const victims = await Victim.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: victims.length,
      data: victims,
    });
  } catch (error) {
    console.error(
      "❌ Failed to fetch victim detection records:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch victim detection records",
      error: error.message,
    });
  }
});

// ============================================================
// GET /:id
// Get one victim detection record
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    const victim = await Victim.findById(req.params.id).lean();

    if (!victim) {
      return res.status(404).json({
        success: false,
        message: "Victim detection record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: victim,
    });
  } catch (error) {
    console.error(
      "❌ Failed to fetch victim record:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch victim detection record",
      error: error.message,
    });
  }
});

// ============================================================
// Multer / Upload Error Handler
// ============================================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
});

// ============================================================
// Export Router
// ============================================================

module.exports = router;