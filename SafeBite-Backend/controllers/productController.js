const Product = require('../models/productModel');
const User = require('../models/userModel');
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

// ---------------------------------------------
// 1. GET PRODUCT BY BARCODE (Public + Smart Search)
// ---------------------------------------------
const getProductByBarcode = async (req, res) => {
    const { barcode } = req.params;
    const deviceId = req.headers['x-device-id']; // Frontend sends this

    try {
        // Basic Validation
        if (!/^[0-9]{8,14}$/.test(barcode)) {
             return res.status(400).json({ message: "Invalid barcode format." });
        }

        // 1. FETCH USER PROFILE (For Personalization)
        let userProfile = null;
        if (deviceId) {
            userProfile = await User.findOne({ deviceId });
            console.log(`👤 Personalizing for: ${userProfile ? userProfile.name : 'Guest'}`);
        }

        // 🔥 FIX: SMART QUERY (Checks String, Number & Trimmed versions)
        const cleanBarcode = barcode.trim();
        
        let product = await Product.findOne({
            $or: [
                { barcode: cleanBarcode },           // As String "890..."
                { barcode: Number(cleanBarcode) }    // As Number 890...
            ]
        });

        let alternatives = [];

        // -----------------------
        // SCENARIO 1: LOCAL DB MATCH
        // -----------------------
        if (product) {
            console.log("✅ Local DB Hit:", product.name);

            // Calculate Risk Runtime
            const personalizedAnalysis = await calculateRisk(product.ingredients, userProfile);

            alternatives = await findBetterAlternatives(
                product.category, 
                personalizedAnalysis.status, 
                product.brand 
            );

            // Fallback Alternatives
            if (alternatives.length === 0 && personalizedAnalysis.status !== 'GREEN') {
                alternatives = await Product.find({ 'analysis.status': 'GREEN' })
                    .limit(3)
                    .select('name brand image analysis.totalRiskScore category');
            }

            // Send Response (Override analysis with personalized one)
            const responseData = product.toObject();
            responseData.analysis = personalizedAnalysis; 

            return res.json({
                success: true,
                source: "SafeBite_Local_DB",
                data: responseData,
                alternatives: alternatives 
            });
        }

        // -----------------------
        // SCENARIO 2: EXTERNAL API (OpenFoodFacts)
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

            // 🛡️ CRITICAL FIX: Safe Split & Filter (Prevents Crash on empty strings)
            const ingredientsArray = (ingredientsText || "")
                .replace(/[()]/g, '')
                .split(',')
                .map(i => i.trim())
                .filter(Boolean); // Removes empty strings like ""
            
            // 1. Standard Analysis (For Database)
            const standardAnalysis = await calculateRisk(ingredientsArray, null);
            standardAnalysis.cachedAt = new Date();

            // 2. Personalized Analysis (For User Response)
            const personalizedAnalysis = await calculateRisk(ingredientsArray, userProfile);

            // 💾 SAVE STANDARD DATA TO DB
            const newProduct = await Product.create({
                barcode: barcode,
                name: externalData.product_name || "Unknown Product",
                brand: externalData.brands || "Unknown Brand",
                image: externalData.image_url,
                category: mainCategory,
                ingredients: ingredientsArray,
                analysis: standardAnalysis 
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
            responseData.analysis = personalizedAnalysis; 

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

// ---------------------------------------------
// 2. ADD PRODUCT (ADMIN PANEL SUPPORT)
// ---------------------------------------------
const addProduct = async (req, res) => {
    try {
        const { barcode, name, ingredients, brand, riskLevel, poisonScore, description } = req.body;

        if (!barcode || !name) {
            return res.status(400).json({ message: "Barcode and Name required." });
        }

        // SAFETY FIX: Ensure ingredients is an array
        const ingredientsArray = typeof ingredients === "string"
            ? ingredients.split(',').map(i => i.trim()).filter(Boolean)
            : Array.isArray(ingredients) ? ingredients : [];

        const score = Number(poisonScore) || 0;

        // Valid Status Check
        const status = ['SAFE','MODERATE','HIGH','GREEN','YELLOW','RED'].includes(riskLevel)
            ? riskLevel
            : 'SAFE';

        const product = await Product.create({
            barcode,
            name,
            brand: brand || 'Generic',
            description,
            ingredients: ingredientsArray,
            analysis: {
                status,
                totalRiskScore: score,
                harmfulIngredients: [],
                isChildSafe: score < 30,
                cachedAt: new Date()
            }
        });

        return res.status(201).json({ success: true, data: product });

    } catch (err) {
        console.error("❌ ADD PRODUCT CRASH:", err);
        return res.status(500).json({ message: "DB Error", error: err.message });
    }
};

// ---------------------------------------------
// 3. SEARCH BY INGREDIENT (Poison Library)
// ---------------------------------------------
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