const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { registerSalon } = require('../controllers/salonController');

// Define routes
router.post('/register', protect, registerSalon);

module.exports = router;