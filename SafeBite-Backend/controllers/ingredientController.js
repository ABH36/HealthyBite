const { calculateRisk } = require('../utils/riskEngine');

// @desc    Analyze ingredients list for safety
// @route   POST /api/analyze
const analyzeIngredients = async (req, res) => {
    try {
        const { ingredients } = req.body;

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({ message: "Please provide an ingredient list." });
        }

        // 🛡️ SECURITY: Limit check
        if (ingredients.length > 50) {
            return res.status(400).json({ message: "Too many ingredients. Please scan a valid product." });
        }

        // Logic ab riskEngine se aayega
        const analysisResult = await calculateRisk(ingredients);

        res.json({
            success: true,
            ...analysisResult
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { analyzeIngredients };