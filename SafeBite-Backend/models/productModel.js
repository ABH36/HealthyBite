const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    barcode: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true // Faster searching ke liye
    },
    name: { type: String, required: true },
    brand: { type: String, default: 'Generic' }, // Default added for safety
    image: { type: String, default: "https://placehold.co/400" }, // Placeholder for UI safety
    
    // ✅ NEW: Description field added for Admin Panel
    description: { type: String }, 

    category: { type: String, index: true, default: 'Packaged Food' },
    
    // Asli ingredients list (Text array)
    ingredients: [String], 

    // Hamara analysis result yahan save hoga (Cache)
    analysis: {
        // ✅ UPDATE: Enum expanded to support both Old (GREEN) and New Admin (SAFE) statuses
        status: { 
            type: String, 
            enum: ['GREEN', 'YELLOW', 'RED', 'SAFE', 'MODERATE', 'HIGH'], 
            default: 'SAFE' 
        },
        
        totalRiskScore: { type: Number, default: 0 },
        
        harmfulIngredients: [{
            name: String,
            riskCategory: String,
            description: String
        }],
        
        isChildSafe: { type: Boolean, default: true },
        cachedAt: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);