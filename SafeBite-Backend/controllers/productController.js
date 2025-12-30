const Product = require('../models/Product');
const User = require('../models/User');
const { calculateRisk } = require('../utils/riskEngine');
const axios = require('axios');

// Helper Function: Find Better Alternatives
const findBetterAlternatives = async (category, currentStatus, currentBrand) => {
    if (currentStatus === 'GREEN' || !category) return [];
    return await Product.find({
        category: { $regex: category, $options: 'i' },
        'analysis.status': 'GREEN',
        brand: { $ne: currentBrand }
    }).limit(3).select('name brand image analysis.totalRiskScore category');
};

const getProductByBarcode = async (req, res) => {
    const { barcode } = req.params;
    const deviceId = req.headers['x-device-id']; // Frontend will send this

    try {
        if (!/^[0-9]{8,14}$/.test(barcode)) {
             return res.status(400).json({ message: "Invalid barcode format." });
        }

        // 1. FETCH USER PROFILE
        let userProfile = null;
        if (deviceId) {
            userProfile = await User.findOne({ deviceId });
            console.log(`👤 Personalizing for: ${userProfile ? userProfile.name : 'Guest'}`);
        }

        let product = await Product.findOne({ barcode });
        let alternatives = [];

        // -----------------------
        // SCENARIO 1: LOCAL DB
        // -----------------------
        if (product) {
            // Local DB se jo mila wo STANDARD data hai.
            // Ab hum RUNTIME par user ke liye RISK calculate karenge.
            const personalizedAnalysis = await calculateRisk(product.ingredients, userProfile);

            alternatives = await findBetterAlternatives(
                product.category, 
                personalizedAnalysis.status, 
                product.brand 
            );

            // Fallback
            if (alternatives.length === 0 && personalizedAnalysis.status !== 'GREEN') {
                alternatives = await Product.find({ 'analysis.status': 'GREEN' })
                    .limit(3)
                    .select('name brand image analysis.totalRiskScore category');
            }

            // DO NOT SAVE personalizedAnalysis to DB.
            // Just send it in response.
            const responseData = product.toObject();
            responseData.analysis = personalizedAnalysis; // 👈 Override ONLY for this response

            return res.json({
                success: true,
                source: "SafeBite_Local_DB",
                data: responseData,
                alternatives: alternatives 
            });
        }

        // -----------------------
        // SCENARIO 2: EXTERNAL API
        // -----------------------
        console.log(`Searching OpenFoodFacts for: ${barcode}...`);
        const externalUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const response = await axios.get(externalUrl);

        if (response.data.status === 1) {
            const externalData = response.data.product;

            let ingredientsText =
                externalData.ingredients_text_en ||
                externalData.ingredients_text ||
                externalData.ingredients_text_hi ||
                externalData.ingredients_text_fr ||
                "";

            if (!ingredientsText || ingredientsText.length > 2000) {
                 return res.status(400).json({ success: false, message: "Ingredients missing or invalid." });
            }

            let mainCategory = "Snacks";
            if (externalData.categories) {
                mainCategory = externalData.categories.split(',')[0].trim();
            }

            const ingredientsArray = ingredientsText.replace(/[()]/g, '').split(',').map(i => i.trim());
            
            // 🔒 CRITICAL FIX: Two Calculations
            // 1. Standard (For Database) - No User Profile
            const standardAnalysis = await calculateRisk(ingredientsArray, null);
            standardAnalysis.cachedAt = new Date();

            // 2. Personalized (For User Response) - With User Profile
            const personalizedAnalysis = await calculateRisk(ingredientsArray, userProfile);

            // 💾 SAVE STANDARD DATA ONLY
            const newProduct = await Product.create({
                barcode: barcode,
                name: externalData.product_name || "Unknown Product",
                brand: externalData.brands || "Unknown Brand",
                image: externalData.image_url,
                category: mainCategory,
                ingredients: ingredientsArray,
                analysis: standardAnalysis // 👈 Saving Standard Analysis
            });

            alternatives = await findBetterAlternatives(
                mainCategory, 
                personalizedAnalysis.status,
                newProduct.brand
            );

            if (alternatives.length === 0 && personalizedAnalysis.status !== 'GREEN') {
                alternatives = await Product.find({ 'analysis.status': 'GREEN' })
                    .limit(3)
                    .select('name brand image analysis.totalRiskScore category');
            }

            // Return Personalized Data
            const responseData = newProduct.toObject();
            responseData.analysis = personalizedAnalysis; // 👈 Sending Personalized Analysis

            return res.json({
                success: true,
                source: "OpenFoodFacts_API",
                data: responseData,
                alternatives: alternatives
            });
        }

        return res.status(404).json({ success: false, message: "Product not found." });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

const addProduct = async (req, res) => {
    try {
        if (!req.body.barcode || !req.body.ingredients || req.body.ingredients.length > 50) return res.status(400).json({ message: "Invalid data." });
        const analysisResult = await calculateRisk(req.body.ingredients, null); // Standard
        analysisResult.cachedAt = new Date();
        const product = await Product.create({ ...req.body, analysis: analysisResult });
        res.status(201).json({ success: true, data: product });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// 🔍 Reverse Search – Poison Library
const searchByIngredient = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Ingredient required." });

        const products = await Product.find({
            ingredients: { $regex: query, $options: 'i' }
        }).select('name brand image analysis.totalRiskScore analysis.status ingredients');

        res.json({ success: true, count: products.length, data: products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};


module.exports = { getProductByBarcode, addProduct, searchByIngredient };
