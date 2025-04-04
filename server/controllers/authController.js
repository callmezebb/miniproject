const User = require('../models/User');
const Salon = require('../models/Salon');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required' 
            });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Create user - password hashing will be done by model middleware
        const newUser = await User.create({
            name,
            email,
            password, // Don't hash here, let the model do it
            userType: 'user',
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                userType: newUser.userType,
            },
        });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};

// Register a new salon
exports.registerSalon = async (req, res) => {
    try {
        const { salonName, ownerName, email, password } = req.body;

        // Validate required fields
        if (!salonName || !ownerName || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required' 
            });
        }

        // Check if the email is already registered
        const existingSalon = await Salon.findOne({ email });
        if (existingSalon) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Create salon - password hashing will be done by model middleware
        const newSalon = await Salon.create({
            name: salonName,
            ownerName: ownerName,
            email,
            password, // Don't hash here, let the model do it
            userType: 'salon',
            isProfileComplete: false
        });

        res.status(201).json({
            success: true,
            message: 'Salon registered successfully',
            salon: {
                id: newSalon._id,
                name: newSalon.name,
                email: newSalon.email,
                userType: newSalon.userType,
            },
        });
    } catch (error) {
        console.error('Error during salon registration:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user with password included
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Debug print to check password matching
        console.log('Attempting login for user:', email);
        
        // Compare the password using the model method
        const isPasswordValid = await user.matchPassword(password);
        
        if (!isPasswordValid) {
            console.log('Password validation failed for user:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('User login successful:', email);
        
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
            },
        });
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

// Login salon
exports.loginSalon = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the salon with password included
        const salon = await Salon.findOne({ email }).select('+password');
        
        if (!salon) {
            console.log('Salon not found:', email);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Debug print to check password matching
        console.log('Attempting login for salon:', email);
        
        // Compare the password using the model method
        const isPasswordValid = await salon.matchPassword(password);
        
        if (!isPasswordValid) {
            console.log('Password validation failed for salon:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: salon._id, userType: salon.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('Salon login successful:', email);
        
        // Remove password from the response
        const salonData = salon.toObject();
        delete salonData.password;

        res.status(200).json({
            success: true,
            token,
            salon: salonData
        });
    } catch (error) {
        console.error('Error during salon login:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: error.message 
        });
    }
};

// Legacy register/login functions for backward compatibility 
exports.register = exports.registerUser;
exports.login = exports.loginUser;