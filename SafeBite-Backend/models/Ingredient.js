const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true 
    }, 
    riskCategory: { 
        type: String, 
        enum: ['Heart Poison', 'Brain Poison', 'Sugar Shock', 'Cancer Linked', 'Hormone Killer', 'Liver/Kidney Damage', 'Safe'],
        required: true
    },
    riskLevel: { 
        type: Number, 
        min: 0, 
        max: 10, 
        required: true 
    },
    description: {
        type: String,
        required: true
    },
    aliases: [String],
    
    // 👇 ChatGPT's Suggestion Added
    childUnsafe: { 
        type: Boolean, 
        default: false 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ingredient', ingredientSchema);