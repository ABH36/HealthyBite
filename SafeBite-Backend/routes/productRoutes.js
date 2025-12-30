const express = require('express');
const router = express.Router();
const { getProductByBarcode, addProduct, searchByIngredient } = require('../controllers/productController');

// 🔐 Middleware: STRICT Admin Security Check
const checkAdmin = (req, res, next) => {
    // 1. Get Secret from Header
    const secret = req.headers['x-admin-secret'];
    
    // 2. Get Secret from Environment (Render Server)
    const ADMIN_SECRET = process.env.VITE_ADMIN_SECRET; 

    // 🛑 CRITICAL SECURITY FIX:
    // Agar server par secret set nahi hai, toh kisi ko access mat do.
    // Hardcoded string hata di gayi hai.
    if (!ADMIN_SECRET) {
        console.error("❌ FATAL ERROR: VITE_ADMIN_SECRET is not set in Environment Variables!");
        return res.status(500).json({ success: false, message: "Server Misconfiguration: Security Key Missing" });
    }
    
    // 3. Match
    if (secret === ADMIN_SECRET) {
        next(); // ✅ Access Granted
    } else {
        console.warn(`⚠️ Unauthorized Admin Access Attempt! IP: ${req.ip}`);
        res.status(403).json({ success: false, message: "Access Denied: Invalid Admin Secret" });
    }
};

// --- ROUTES ---

// 1. 🔍 Poison Library Search
router.get('/search-ingredient', searchByIngredient);

// 2. 📱 Get Product by Barcode (Public Access)
router.get('/:barcode', getProductByBarcode);

// 3. 📦 Add Product (Admin Only) - SECURED 🔒
router.post('/', checkAdmin, addProduct);

module.exports = router;