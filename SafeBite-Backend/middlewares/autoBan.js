const Ban = require("../models/Ban");

module.exports = async (req, res, next) => {
  const ip = req.ip;
  let entry = await Ban.findOne({ ip });

  if (entry?.banned)
    return res.status(403).json({ msg: "IP Banned" });

  next();
};
