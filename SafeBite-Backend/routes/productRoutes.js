const express = require('express');
const router = express.Router();
const { getProductByBarcode, addProduct, searchByIngredient } = require('../controllers/productController');

router.get('/search-ingredient', searchByIngredient); // 🔍 Poison Library
router.get('/:barcode', getProductByBarcode);
router.post('/add', addProduct);

module.exports = router;
