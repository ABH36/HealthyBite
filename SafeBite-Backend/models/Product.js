const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    barcode: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true // Faster searching ke liye
    },
    name: { type: String, required: true },
    brand: { type: String },
    image: { type: String }, // URL of product image
    
    category: { type: String, index: true },
    // Asli ingredients list (Text array)
    ingredients: [String], 

    // Hamara analysis result yahan save hoga (Cache)
    // Taaki baar-baar calculate na karna pade
    analysis: {
        status: { type: String, enum: ['GREEN', 'YELLOW', 'RED'] },
        totalRiskScore: Number,
        harmfulIngredients: [{
            name: String,
            riskCategory: String,
            description: String
        }],
        isChildSafe: Boolean,
        cachedAt: { type: Date }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);