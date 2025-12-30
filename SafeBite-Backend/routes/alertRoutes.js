const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// get active alerts
router.get("/", async (req, res) => {
  const alerts = await Alert.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  res.json({ data: alerts });
});

module.exports = router;
