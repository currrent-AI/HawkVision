const mongoose = require("mongoose");

const detectionSchema = new mongoose.Schema(
  {
    confidence: {
      type: Number,
      required: true,
    },

    bbox: {
      x1: {
        type: Number,
        required: true,
      },
      y1: {
        type: Number,
        required: true,
      },
      x2: {
        type: Number,
        required: true,
      },
      y2: {
        type: Number,
        required: true,
      },
    },
  },
  { _id: false }
);

const victimSchema = new mongoose.Schema(
  {
    imageName: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    totalVictims: {
      type: Number,
      required: true,
      min: 0,
    },

    highRisk: {
      type: Number,
      required: true,
      min: 0,
    },

    mediumRisk: {
      type: Number,
      required: true,
      min: 0,
    },

    lowRisk: {
      type: Number,
      required: true,
      min: 0,
    },

    detections: {
      type: [detectionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Victim", victimSchema);