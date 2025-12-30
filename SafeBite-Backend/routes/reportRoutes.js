const express = require('express');
const router = express.Router();
const { submitReport } = require('../controllers/reportController');

router.post('/', submitReport);

module.exports = router;