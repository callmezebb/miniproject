const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    registerSalon, 
    loginUser, 
    loginSalon,
    register,
    login
} = require('../controllers/authController');

// Debug endpoints
router.get('/test', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'Auth API is working!' 
    });
});

// User routes
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

// Salon routes
router.post('/salon/register', registerSalon);
router.post('/salon/login', loginSalon);

// Legacy routes for backward compatibility
router.post('/register', register);
router.post('/login', login);

module.exports = router;