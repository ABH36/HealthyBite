const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    barcode: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true // 🚀 Faster searching
    },
    name: { type: String, required: true },
    brand: { type: String, default: 'Generic' },
    image: { type: String, default: "https://placehold.co/400" }, // ✅ Default Image added
    
    // ✅ New Field (Admin Panel se description save karne ke liye)
    description: { type: String }, 

    category: { type: String, index: true, default: 'Packaged Food' },
    
    // Ingredients List (Array of Strings)
    ingredients: [String], 

    // 🧠 ADVANCED ANALYSIS OBJECT (Aapka purana logic)
    analysis: {
        // Status: Supports both Old (GREEN/RED) and New (SAFE/HIGH) formats
        status: { 
            type: String, 
            enum: ['GREEN', 'YELLOW', 'RED', 'SAFE', 'MODERATE', 'HIGH'], 
            default: 'SAFE' 
        },
        
        totalRiskScore: { type: Number, default: 0 },
        
        // Detailed breakdown of harmful stuff
        harmfulIngredients: [{
            name: String,
            riskCategory: String,
            description: String
        }],
        
        isChildSafe: { type: Boolean, default: true },
        
        // Cache Timestamp
        cachedAt: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);