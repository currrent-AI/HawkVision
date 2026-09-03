const Alert = require("../models/alert");

// Convert a Disaster record into an alert format
const buildDisasterAlert = (disaster) => ({
  id: disaster._id,
  type: `${disaster.type} Disaster`,
  title: disaster.description || `${disaster.type} Incident`,
  message:
    disaster.description ||
    `${disaster.severity} ${disaster.type} emergency reported at ${disaster.location}.`,
  severity: disaster.severity,
  location: disaster.location,
  status: disaster.status,
  latitude: disaster.latitude,
  longitude: disaster.longitude,
  createdAt: disaster.createdAt,
  source: "Disaster",
});

// Convert an SOS record into an alert format
const buildSosAlert = (sos) => ({
  id: sos._id,
  type: "SOS Emergency",
  title: sos.notes || "SOS Distress Signal",
  message:
    sos.notes ||
    `${sos.priority} priority SOS distress signal from ${sos.location}.`,
  severity: sos.priority,
  location: sos.location,
  status: sos.status,
  latitude: sos.latitude,
  longitude: sos.longitude,
  createdAt: sos.createdAt,
  source: "SOS",
});

// Combine existing Disaster and SOS alerts
const buildAlerts = (disasters, sosSignals) => {
  const alerts = [
    ...disasters.map(buildDisasterAlert),
    ...sosSignals.map(buildSosAlert),
  ];

  return alerts.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

// Create a real alert document in MongoDB
const createAlert = async ({
  type,
  title,
  description = "",
  severity,
  source = "",
  location = {},
  metadata = {},
}) => {
  const alert = await Alert.create({
    type,
    title,
    description,
    severity,
    source,
    location,
    metadata,
  });

  return alert;
};

module.exports = {
  buildAlerts,
  createAlert,
};