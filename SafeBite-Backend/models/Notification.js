const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    level: { 
        type: String, 
        enum: ['info', 'warning', 'emergency'], 
        default: 'info' 
    },
    city: { type: String, default: 'All' }, // 'All' for National, or specific city name
    isNational: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
}, {
    timestamps: true
});

// Auto-delete expired alerts (TTL Index)
// MongoDB apne aap expire hone ke baad data uda dega
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);