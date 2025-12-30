const express = require('express');
const router = express.Router();
const { analyzeIngredients } = require('../controllers/ingredientController');

// POST request aayegi /api/analyze par
router.post('/analyze', analyzeIngredients);

module.exports = router;