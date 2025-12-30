const HealthCard = require('../models/HealthCard');
const Product = require('../models/Product');

// Security Key (Same as Admin Controller)
const ADMIN_SECRET = process.env.ADMIN_SECRET || "safebite_admin_secure_key_2025";

// @desc    Get Today's Health Card (Auto-Rotating)
// @route   GET /api/content/daily-card
const getDailyCard = async (req, res) => {
    try {
        // 🔧 FIX 1: Logic Rotation (Daily Change)
        const count = await HealthCard.countDocuments({ isActive: true });
        
        if (count === 0) {
            // Default Fallback if DB empty
            return res.json({
                success: true,
                data: {
                    title: "Welcome to SafeBite",
                    poisonName: "Hidden Sugar",
                    damage: "Causes Insulin Spikes",
                    tip: "Always check labels for 'Added Sugar'",
                    type: "did_you_know"
                }
            });
        }

        // Math magic: Aaj ki taareekh (Date) ke hisaab se index chuno
        const today = new Date().getDate(); // 1 to 31
        const index = today % count; // Modulo ensures we never go out of bounds

        // Skip to that index and pick one
        const cards = await HealthCard.find({ isActive: true }).skip(index).limit(1);
        
        res.json({ success: true, data: cards[0] });

    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Get Weekly Unsafe Food Index (Real Data)
// @route   GET /api/content/weekly-index
const getWeeklyIndex = async (req, res) => {
    try {
        // 🔧 FIX 2: Real Weekly Data (Last 7 Days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const unsafeList = await Product.find({ 
            'analysis.status': 'RED',
            // Only fetch products scanned/updated in last 7 days
            // Note: If your seeding didn't add timestamps, this might return empty initially.
            // But for a real app, this is correct.
            updatedAt: { $gte: sevenDaysAgo } 
        })
        .limit(5)
        .select('name brand image analysis.harmfulIngredients')
        .sort({ updatedAt: -1 }); // Newest first

        // Fallback: Agar pichle 7 din me kuch nahi mila, to general RED dikha do
        // (Taaki App khali na dikhe launch par)
        if (unsafeList.length === 0) {
            const fallbackList = await Product.find({ 'analysis.status': 'RED' })
                .limit(5)
                .select('name brand image analysis.harmfulIngredients');
            return res.json({ success: true, data: fallbackList });
        }

        res.json({ success: true, data: unsafeList });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// @desc    Create Card (Secured)
// @route   POST /api/content/card
const createCard = async (req, res) => {
    // 🔧 FIX 3: Security Gate
    const secret = req.headers['x-admin-secret'];
    if (!secret || secret !== ADMIN_SECRET) {
        return res.status(403).json({ message: "Unauthorized: Admin Secret Required" });
    }

    try {
        const { title, poisonName, damage, tip, type, language } = req.body;
        const card = await HealthCard.create({ 
            title, 
            poisonName, 
            damage, 
            tip, 
            type,
            language: language || 'en' // Default to English
        });
        res.status(201).json({ success: true, message: "Card Created!", data: card });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

module.exports = { getDailyCard, getWeeklyIndex, createCard };