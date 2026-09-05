const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Critical", "High", "Medium"],
      default: "Critical",
    },

    status: {
  type: String,
  enum: [
    "Active",
    "Acknowledged",
    "Cancelled",
    "Resolved",
  ],
  default: "Active",
},
    notes: {
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
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sos", sosSchema);
