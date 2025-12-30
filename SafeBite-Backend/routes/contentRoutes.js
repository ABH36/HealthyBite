const express = require('express');
const router = express.Router();
const { getDailyCard, getWeeklyIndex, createCard } = require('../controllers/contentController');

router.get('/daily-card', getDailyCard);
router.get('/weekly-index', getWeeklyIndex);
router.post('/card', createCard); // Admin Route (Secure in V2)

module.exports = router;