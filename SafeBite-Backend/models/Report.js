const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    barcode: { type: String, required: true },
    productName: { type: String },
    issueType: { 
        type: String, 
        enum: ['Wrong Ingredients', 'Incorrect Risk Score', 'Barcode Error', 'Other'],
        required: true 
    },
    description: { type: String },
    
    // 🔧 FIX 1: Add 'Rejected' to enum
    status: { 
        type: String, 
        enum: ['Pending', 'Resolved', 'Rejected'], 
        default: 'Pending' 
    },

    // 🔧 FIX 2: Separate Admin Note Field (Clean Data)
    adminNote: { type: String } 

}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);