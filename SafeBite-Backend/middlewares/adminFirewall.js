const crypto = require("crypto");

module.exports = (req, res, next) => {
  const deviceId = req.headers['x-device-id'];
const secret   = req.headers['x-admin-secret'];

if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ message: "Invalid Admin Secret" });
}

// First time admin device auto-register
if (!global.ADMIN_DEVICE_ID) {
    global.ADMIN_DEVICE_ID = deviceId;
}

// Lock admin to one device
if (deviceId !== global.ADMIN_DEVICE_ID) {
    return res.status(403).json({ message: "This device is not authorized" });
}

next();

};
