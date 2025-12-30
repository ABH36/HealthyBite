const mongoose = require("mongoose");

module.exports = mongoose.model("Ban", new mongoose.Schema({
  ip: String,
  reason: String,
  count: { type: Number, default: 1 },
  banned: { type: Boolean, default: false }
}));
