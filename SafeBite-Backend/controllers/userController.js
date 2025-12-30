const User = require('../models/userModel');
const Product = require('../models/productModel');
const { calculateRisk } = require('../utils/riskEngine'); // 👈 IMPORT NEEDED FOR FIX 3

// ... (getUserProfile aur updateHealthProfile waise hi rahenge - Same as before) ...
const getUserProfile = async (req, res) => {
    try {
        const { deviceId } = req.params;
        let user = await User.findOne({ deviceId });
        if (!user) {
            user = await User.create({ deviceId, healthProfile: { conditions: [], allergens: [] } });
        }
        res.json({ success: true, data: user });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

const updateHealthProfile = async (req, res) => {
    try {
        const { deviceId, name, age, gender, conditions, allergens } = req.body;
        const updateFields = { name: name };
        if (age !== undefined) updateFields['healthProfile.age'] = age;
        if (gender !== undefined) updateFields['healthProfile.gender'] = gender;
        if (conditions !== undefined) updateFields['healthProfile.conditions'] = conditions;
        if (allergens !== undefined) updateFields['healthProfile.allergens'] = allergens;

        const user = await User.findOneAndUpdate(
            { deviceId },
            { $set: updateFields },
            { new: true, upsert: true }
        );
        res.json({ success: true, message: "Health Profile Updated!", data: user });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

// ---------------------------------------------------------
// 👇 THE FIXED LOG FUNCTION (Medical Grade)
// ---------------------------------------------------------
const logConsumption = async (req, res) => {
    try {
        const { deviceId, barcode } = req.body;
        
        // 1. Find User & Product
        const user = await User.findOne({ deviceId });
        const product = await Product.findOne({ barcode });

        if (!user || !product) {
            return res.status(404).json({ message: "User or Product not found." });
        }

        // 🔒 FIX 3: Calculate Personalized Score (Medical Grade)
        // Standard score nahi, user ka specific score chahiye (e.g., Diabetic user eating sugar = Higher Score)
        const personalizedAnalysis = await calculateRisk(product.ingredients, user);
        const productScore = personalizedAnalysis.totalRiskScore || 0;

        // 3. Today's Date
        const today = new Date().toISOString().split('T')[0];

        // 🔒 FIX 1: Safety Check (Crash Prevention)
        if (!user.dailyLog) user.dailyLog = [];

        let logEntry = user.dailyLog.find(log => log.date === today);

        if (logEntry) {
            // 🔒 FIX 2: Spam Protection (Duplicate Check)
            if (logEntry.productsScanned.includes(product._id)) {
                return res.json({
                    success: true,
                    message: "Already logged today.",
                    data: { 
                        totalScore: logEntry.totalPoisonScore,
                        productName: product.name
                    }
                });
            }

            // Add to existing log
            logEntry.productsScanned.push(product._id);
            logEntry.totalPoisonScore += productScore;
        } else {
            // Create new log for today
            user.dailyLog.push({
                date: today,
                productsScanned: [product._id],
                totalPoisonScore: productScore
            });
        }

        await user.save();

        // Updated log entry fetch karo return ke liye
        const updatedLog = user.dailyLog.find(log => log.date === today);

        res.json({
            success: true,
            message: "Added to Daily Intake!",
            data: {
                totalScore: updatedLog.totalPoisonScore,
                productName: product.name,
                addedScore: productScore
            }
        });

    } catch (error) {
        console.error("Log Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
const updateFcmToken = async (req, res) => {
    const { deviceId, token } = req.body;
    try {
        let user = await User.findOne({ deviceId });
        if (!user) {
            // Create user if not exists (First time open)
            user = new User({ deviceId, fcmToken: token });
        } else {
            // Update token
            user.fcmToken = token;
        }
        await user.save();
        res.json({ success: true, message: "Token Saved" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
module.exports = { getUserProfile, updateHealthProfile, logConsumption, updateFcmToken};