const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "Flood Warning",
        "Flood",
        "Earthquake",
        "Landslide",
        "Fire",
        "Storm",
        "SOS Emergency",
        "Victim Detected",
        "System Alert"
      ],
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    severity: {
      type: String,
      required: true,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },

    source: {
      type: String,
      default: "",
    },

    location: {
      name: {
        type: String,
        default: "",
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ACKNOWLEDGED", "RESOLVED"],
      default: "ACTIVE",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    acknowledgedAt: {
      type: Date,
    },

    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Alert", alertSchema);