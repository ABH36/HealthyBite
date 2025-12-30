const firewall = require("../middlewares/adminFirewall");
const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getPendingReports, 
    resolveReport,
    createAlert,
    getAllAdminAlerts,
    deleteAlert
} = require('../controllers/adminController');

router.use(firewall);
// All Routes require 'x-admin-secret' header
router.get('/stats', getDashboardStats);
router.get('/reports', getPendingReports);
router.put('/report/:id', resolveReport);

// Notification Management
router.post('/alert', createAlert);
router.get('/alerts-history', getAllAdminAlerts);
router.delete('/alert/:id', deleteAlert);

module.exports = router;