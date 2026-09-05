const mongoose = require("mongoose");

const shelterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 0,
    },

    occupied: {
      type: Number,
      default: 0,
      min: 0,
    },

    contact: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Available", "Full", "Closed"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

/*
  Automatically prevent occupied beds
  from being greater than capacity.
*/

shelterSchema.pre("save", function (next) {
  if (this.occupied > this.capacity) {
    this.occupied = this.capacity;
  }

  if (this.occupied === this.capacity) {
    this.status = "Full";
  }

  next();
});

module.exports = mongoose.model(
  "Shelter",
  shelterSchema
);