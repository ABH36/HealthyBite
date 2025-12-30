const Audit = require("../models/AdminAudit");

module.exports = async (req, res, next) => {
  if (!req.headers["x-admin-secret"]) return next();

  await Audit.create({
    action: req.method,
    adminDevice: req.headers["x-device-id"],
    ip: req.ip,
    route: req.originalUrl
  });

  next();
};
