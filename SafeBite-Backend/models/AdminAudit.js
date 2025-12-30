const mongoose = require("mongoose");

module.exports = mongoose.model("AdminAudit", new mongoose.Schema({
  action: String,
  adminDevice: String,
  ip: String,
  route: String,
  at: { type: Date, default: Date.now }
}));
