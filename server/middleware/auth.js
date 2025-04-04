const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Salon = require('../models/Salon');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    // Get token from headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user or salon
        if (decoded.userType === 'user') {
            req.user = await User.findById(decoded.id);
        } else if (decoded.userType === 'salon') {
            req.user = await Salon.findById(decoded.id);
        }

        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Add userType to request
        req.user.userType = decoded.userType;
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Grant access to specific user types
exports.authorize = (...userTypes) => {
    return (req, res, next) => {
        if (!userTypes.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: `User type ${req.user.userType} is not authorized to access this route`
            });
        }
        next();
    };
};