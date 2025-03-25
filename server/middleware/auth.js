const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Salon = require('../models/Salon');

// Protect routes
exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check user type and get correct entity
        if (decoded.userType === 'salon') {
            req.user = await Salon.findById(decoded.id).select('-password');
        } else {
            req.user = await User.findById(decoded.id).select('-password');
        }

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Fix: Set the correct userType
        req.user.userType = decoded.userType;
        next();
    } catch (error) {
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