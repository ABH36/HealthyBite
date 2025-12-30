const Report = require('../models/Report');
const Product = require('../models/Product');
const Notification = require('../models/Notification'); // 👈 NEW

// 🔒 SECURITY LAYER
// Real production me ye .env file me hona chahiye
// Example: ADMIN_SECRET=safebite_admin_secure_key_2025
const ADMIN_SECRET = process.env.ADMIN_SECRET || "safebite_admin_secure_key_2025";

const verifyAdmin = (req, res) => {
    const secret = req.headers['x-admin-secret'];
    if (!secret || secret !== ADMIN_SECRET) {
        return false;
    }
    return true;
};

// ---------------------------------------------------------
// 📊 DASHBOARD & REPORTS (Existing + Secured)
// ---------------------------------------------------------

// @desc    Get Dashboard Stats
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
    if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized Access" });

    try {
        const totalScanned = await Product.countDocuments();
        const dangerousCount = await Product.countDocuments({ 'analysis.status': 'RED' });
        
        // Brand Safety Scoring (Fixed Logic)
        const unsafeBrands = await Product.aggregate([
            { $match: { 'analysis.status': 'RED' } },
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Count Active Alerts
        const activeAlerts = await Notification.countDocuments();

        res.json({
            success: true,
            stats: {
                totalProducts: totalScanned,
                dangerousProducts: dangerousCount,
                unsafeBrands: unsafeBrands,
                activeAlerts: activeAlerts
            }
        });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Get Pending Reports
// @route   GET /api/admin/reports
const getPendingReports = async (req, res) => {
    if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized Access" });

    try {
        const reports = await Report.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json({ success: true, count: reports.length, data: reports });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Resolve Report
// @route   PUT /api/admin/report/:id
const resolveReport = async (req, res) => {
    if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized Access" });

    try {
        const { status, adminNote } = req.body;
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        report.status = status; // Resolved or Rejected
        report.adminNote = adminNote || 'No admin note';
        await report.save();

        res.json({ success: true, message: `Report ${status}`, data: report });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// ---------------------------------------------------------
// 📢 NATIONAL NOTIFICATION ENGINE (NEW)
// ---------------------------------------------------------

// @desc    Create New Alert
// @route   POST /api/admin/alert
const createAlert = async (req, res) => {
    if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized Access" });

    try {
        const { title, message, level, city, isNational, expiryHours } = req.body;

        if (!title || !message || !expiryHours) {
            return res.status(400).json({ message: "Title, Message and Expiry are required." });
        }

        // Calculate Expiry Date
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(expiryHours));

        const alert = await Notification.create({
            title,
            message,
            level, // info, warning, emergency
            city: isNational ? 'All' : city,
            isNational,
            expiresAt
        });

        res.status(201).json({ success: true, message: "🚨 Alert Published Successfully!", data: alert });

    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Get All Admin Alerts (History)
// @route   GET /api/admin/alerts-history
const getAllAdminAlerts = async (req, res) => {
    if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized Access" });

    try {
        const alerts = await Notification.find().sort({ createdAt: -1 });
        res.json({ success: true, count: alerts.length, data: alerts });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Delete Alert (Emergency Stop)
// @route   DELETE /api/admin/alert/:id
const deleteAlert = async (req, res) => {
    if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized Access" });

    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Alert Removed." });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

module.exports = { 
    getDashboardStats, 
    getPendingReports, 
    resolveReport,
    createAlert,
    getAllAdminAlerts,
    deleteAlert
};