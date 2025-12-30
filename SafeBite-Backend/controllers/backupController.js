const fs = require("fs");
const path = require("path");

const Product = require("../models/Product");
const User = require("../models/User");
const Report = require("../models/Report");
const Alert = require("../models/Alert");
const HealthCard = require("../models/HealthCard");

exports.triggerBackup = async (req, res) => {
  try {
    const stamp = new Date().toISOString().replace(/:/g, "-");
    const dir = path.join(__dirname, "../backups");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const backup = {
      meta: { createdAt: new Date() },
      data: {
        products: await Product.find(),
        users: await User.find(),
        reports: await Report.find(),
        alerts: await Alert.find(),
        cards: await HealthCard.find()
      }
    };

    const file = `safebite_backup_${stamp}.json`;
    fs.writeFileSync(path.join(dir, file), JSON.stringify(backup, null, 2));

    res.json({ success: true, file });
  } catch (e) {
    console.error("Backup Failed:", e);
    res.status(500).json({ message: "Backup Failed" });
  }
};

exports.getBackups = (req, res) => {
  const dir = path.join(__dirname, "../backups");
  if (!fs.existsSync(dir)) return res.json({ data: [] });
  res.json({ data: fs.readdirSync(dir).reverse() });
};
