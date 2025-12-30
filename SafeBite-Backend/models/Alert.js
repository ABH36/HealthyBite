const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  title: String,
  message: String,
  level: { type: String, enum: ["info", "warning", "emergency"], default: "info" },
  city: String,
  isNational: { type: Boolean, default: true },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
