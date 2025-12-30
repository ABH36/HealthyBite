const mongoose = require('mongoose');

const healthCardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    poisonName: { type: String, required: true },
    damage: { type: String, required: true },
    tip: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['did_you_know', 'alert', 'myth_buster'], 
        default: 'did_you_know' 
    },
    isActive: { type: Boolean, default: true },
    
    // 🔧 FIX 5: Language Support (Future-proofing)
    language: { type: String, default: 'en' } 

}, {
    timestamps: true
});

module.exports = mongoose.model('HealthCard', healthCardSchema);