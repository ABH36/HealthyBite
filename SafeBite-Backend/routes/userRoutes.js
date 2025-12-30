const express = require('express');
const router = express.Router();
const { getUserProfile, updateHealthProfile, logConsumption, updateFcmToken } = require('../controllers/userController');

router.get('/:deviceId', getUserProfile);
router.put('/update', updateHealthProfile);
router.post('/log', logConsumption);
router.post('/fcm', updateFcmToken); // 👈 NEW ROUTE

module.exports = router;