const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "Guest User" },

    cmToken: { type: String, default: null },
    
    // 🩺 HEALTH PROFILE (The Core Intelligence)
    healthProfile: {
        age: { type: Number },
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        
        // 🔧 FIX: Enum removed for AI Scalability
        conditions: [{ type: String }], 

        // Allergies
        allergens: [{ type: String }]
    },

    dailyLog: [{
        date: { type: String },
        productsScanned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        totalPoisonScore: { type: Number, default: 0 }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);