const express = require("express");
const Shelter = require("../models/shelter");

const router = express.Router();

/*
  Calculate distance between two coordinates
  using the Haversine formula.

  Result is returned in kilometers.
*/

const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const earthRadius = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
};


/*
  Add calculated information to shelter.
*/

const formatShelter = (
  shelter,
  userLat = null,
  userLng = null
) => {
  const data = shelter.toObject
    ? shelter.toObject()
    : shelter;

  const capacity =
    Number(data.capacity) || 0;

  const occupied =
    Number(data.occupied) || 0;

  const availableBeds =
    Math.max(
      0,
      capacity - occupied
    );

  let calculatedStatus =
    data.status;

  if (data.status !== "Closed") {
    if (availableBeds <= 0) {
      calculatedStatus = "Full";
    } else if (
      availableBeds <= capacity * 0.25
    ) {
      calculatedStatus = "Limited";
    } else {
      calculatedStatus = "Available";
    }
  }

  let distance = null;

  if (
    userLat !== null &&
    userLng !== null &&
    data.latitude !== undefined &&
    data.longitude !== undefined
  ) {
    distance = calculateDistance(
      Number(userLat),
      Number(userLng),
      Number(data.latitude),
      Number(data.longitude)
    );
  }

  return {
    ...data,

    availableBeds,

    distance:
      distance !== null
        ? Number(distance.toFixed(1))
        : null,

    calculatedStatus,
  };
};


/*
  GET /api/shelters

  Optional:
  ?lat=31.5204&lng=74.3587

  If coordinates are provided,
  shelters are sorted by distance.
*/

router.get("/", async (req, res) => {
  try {
    const shelters =
      await Shelter.find().sort({
        createdAt: -1,
      });

    const hasCoordinates =
      req.query.lat !== undefined &&
      req.query.lng !== undefined;

    const userLat = hasCoordinates
      ? Number(req.query.lat)
      : null;

    const userLng = hasCoordinates
      ? Number(req.query.lng)
      : null;

    if (
      hasCoordinates &&
      (!Number.isFinite(userLat) ||
        !Number.isFinite(userLng))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid latitude or longitude",
      });
    }

    let data = shelters.map(
      (shelter) =>
        formatShelter(
          shelter,
          userLat,
          userLng
        )
    );

    if (hasCoordinates) {
      data.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;

        return a.distance - b.distance;
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Fetch shelters error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch shelters",
      error: error.message,
    });
  }
});


/*
  GET nearby shelters

  Example:
  /api/shelters/nearby?lat=31.5204&lng=74.3587&radius=20
*/

router.get("/nearby", async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 25,
    } = req.query;

    const userLat = Number(lat);
    const userLng = Number(lng);
    const maxRadius = Number(radius);

    if (
      !Number.isFinite(userLat) ||
      !Number.isFinite(userLng)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid latitude and longitude are required",
      });
    }

    if (
      !Number.isFinite(maxRadius) ||
      maxRadius <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Radius must be a positive number",
      });
    }

    const shelters =
      await Shelter.find();

    const nearbyShelters =
      shelters
        .map((shelter) =>
          formatShelter(
            shelter,
            userLat,
            userLng
          )
        )
        .filter(
          (shelter) =>
            shelter.distance !== null &&
            shelter.distance <= maxRadius
        )
        .sort(
          (a, b) =>
            a.distance - b.distance
        );

    res.status(200).json({
      success: true,
      count:
        nearbyShelters.length,
      data: nearbyShelters,
    });
  } catch (error) {
    console.error(
      "Nearby shelters error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to find nearby shelters",
      error: error.message,
    });
  }
});


/*
  GET best shelter recommendation

  Ranking:
  1. Not closed
  2. Has available beds
  3. Shorter distance
  4. Better remaining capacity
*/

router.get(
  "/recommendation/best",
  async (req, res) => {
    try {
      const {
        lat,
        lng,
      } = req.query;

      const userLat = Number(lat);
      const userLng = Number(lng);

      if (
        !Number.isFinite(userLat) ||
        !Number.isFinite(userLng)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid latitude and longitude are required",
        });
      }

      const shelters =
        await Shelter.find();

      const candidates =
        shelters
          .map((shelter) =>
            formatShelter(
              shelter,
              userLat,
              userLng
            )
          )
          .filter(
            (shelter) =>
              shelter.calculatedStatus !==
                "Closed" &&
              shelter.availableBeds > 0
          );

      if (!candidates.length) {
        return res.status(404).json({
          success: false,
          message:
            "No available shelter found",
        });
      }

      candidates.sort((a, b) => {
        /*
          Distance has highest priority.
        */

        if (
          a.distance !== null &&
          b.distance !== null &&
          a.distance !== b.distance
        ) {
          return (
            a.distance - b.distance
          );
        }

        /*
          Then available beds.
        */

        return (
          b.availableBeds -
          a.availableBeds
        );
      });

      const best =
        candidates[0];

      res.status(200).json({
        success: true,

        message:
          "Best shelter recommendation generated",

        data: {
          ...best,

          recommendationReason:
            `${best.name} is the best available option based on distance, availability and remaining capacity.`,
        },
      });
    } catch (error) {
      console.error(
        "Shelter recommendation error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to generate shelter recommendation",
        error: error.message,
      });
    }
  }
);


/*
  GET single shelter
*/

router.get("/:id", async (req, res) => {
  try {
    const shelter =
      await Shelter.findById(
        req.params.id
      );

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message:
          "Shelter not found",
      });
    }

    const data =
      formatShelter(shelter);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch shelter",
      error: error.message,
    });
  }
});


/*
  CREATE shelter
*/

router.post("/", async (req, res) => {
  try {
    const shelter =
      await Shelter.create(
        req.body
      );

    const data =
      formatShelter(shelter);

    res.status(201).json({
      success: true,
      message:
        "Shelter created successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Create shelter error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        "Failed to create shelter",
      error: error.message,
    });
  }
});


/*
  UPDATE shelter
*/

router.put("/:id", async (req, res) => {
  try {
    const shelter =
      await Shelter.findByIdAndUpdate(
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
        message:
          "Shelter not found",
      });
    }

    const data =
      formatShelter(shelter);

    res.status(200).json({
      success: true,
      message:
        "Shelter updated successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Update shelter error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        "Failed to update shelter",
      error: error.message,
    });
  }
});


/*
  DELETE shelter
*/

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const shelter =
        await Shelter.findByIdAndDelete(
          req.params.id
        );

      if (!shelter) {
        return res.status(404).json({
          success: false,
          message:
            "Shelter not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Shelter deleted successfully",
        data: shelter,
      });
    } catch (error) {
      console.error(
        "Delete shelter error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete shelter",
        error: error.message,
      });
    }
  }
);


module.exports = router;