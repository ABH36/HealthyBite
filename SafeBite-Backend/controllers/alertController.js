const Alert = require('../models/Alert');
const User = require('../models/userModel.js');
import firebaseAdmin from "../firebaseAdmin.js";
const admin = firebaseAdmin();
// Import Firebase

// @desc    Create Alert & Send Push Notification
// @route   POST /api/admin/alert
const createAlert = async (req, res) => {
    // 🔒 Security checks handled by middleware
    
    try {
        const { title, message, level, expiryHours, isNational, city } = req.body;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + Number(expiryHours));

        // 1. Save to Database
        const alert = await Alert.create({
            title,
            message,
            level,
            city,
            isNational,
            expiresAt
        });

        // 2. SEND PUSH NOTIFICATION 🔔
        // Get all user tokens
        const users = await User.find({ fcmToken: { $ne: null } }).select('fcmToken');
        const tokens = users.map(u => u.fcmToken);

        if (tokens.length > 0) {
            const pushMessage = {
                notification: {
                    title: `🚨 ${title}`,
                    body: message,
                },
                tokens: tokens, // Send to all
            };

            // Send Multicast
            const response = await admin.messaging().sendEachForMulticast(pushMessage);
            console.log(`🔥 Alert Sent! Success: ${response.successCount}, Fail: ${response.failureCount}`);
        }

        res.status(201).json({ success: true, data: alert, message: "Alert Published & Notifications Sent!" });

    } catch (error) {
        console.error("Alert Error:", error);
        res.status(500).json({ message: "Failed to create alert" });
    }
};

const getHistory = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 });
        res.json({ success: true, data: alerts });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

const deleteAlert = async (req, res) => {
    try {
        await Alert.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Alert Deleted" });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

module.exports = { createAlert, getHistory, deleteAlert };