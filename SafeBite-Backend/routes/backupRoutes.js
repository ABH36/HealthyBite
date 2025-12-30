const router = require("express").Router();
const { triggerBackup, getBackups } = require("../controllers/backupController");

router.get("/now", triggerBackup);
router.get("/list", getBackups);

module.exports = router;
