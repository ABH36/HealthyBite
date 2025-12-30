const Notification = require('../models/Notification');

// @desc    Get Active Public Alerts
// @route   GET /api/alerts
const getActiveAlerts = async (req, res) => {
    try {
        // Fetch only alerts that haven't expired
        // MongoDB TTL index handles deletion, but query safety is good
        const now = new Date();
        const alerts = await Notification.find({ 
            expiresAt: { $gt: now } 
        }).sort({ createdAt: -1 });

        res.json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getActiveAlerts };