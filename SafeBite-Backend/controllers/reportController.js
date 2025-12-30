const Report = require('../models/Report');

// @desc    Submit a new report
// @route   POST /api/report
const submitReport = async (req, res) => {
    try {
        const { barcode, productName, issueType, description } = req.body;

        // 1. Basic Validation
        if (!barcode || !issueType) {
            return res.status(400).json({ message: "Barcode and Issue Type are required." });
        }

        // 🔒 LOCK 1: Spam Protection (Limit Description Length)
        // Koi puri kahani na likh de, ya database spam na kare
        if (description && description.length > 300) {
            return res.status(400).json({ message: "Description is too long. Please keep it under 300 characters." });
        }

        // 🔒 LOCK 2: Duplicate Protection (Flood Control)
        // Agar same barcode aur same issue pehle se 'Pending' hai, to naya mat banao
        const existingReport = await Report.findOne({ 
            barcode: barcode, 
            issueType: issueType, 
            status: 'Pending' 
        });

        if (existingReport) {
            return res.status(400).json({ message: "This issue has already been reported and is pending review." });
        }

        // Create Report
        const report = await Report.create({
            barcode,
            productName,
            issueType,
            description
        });

        res.status(201).json({ 
            success: true, 
            message: "Report submitted successfully. We will review it soon.",
            data: report 
        });

    } catch (error) {
        console.error("Report Error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { submitReport };