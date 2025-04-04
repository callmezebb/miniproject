const Salon = require('../models/Salon');

// @desc    Register salon
// @route   POST /api/salons/register
exports.registerSalon = async (req, res) => {
    try {
        const {
            name,
            location,
            phone,
            workingHours,
            services,
            email
        } = req.body;

        // Find and update salon
        const salon = await Salon.findOneAndUpdate(
            { email },
            {
                name,
                location,
                phone,
                workingHours,
                services
            },
            { new: true, runValidators: true }
        );

        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }

        res.status(200).json({
            success: true,
            data: salon
        });
    } catch (error) {
        console.error('Salon registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering salon'
        });
    }
};

// Get all registered salons
exports.getRegisteredSalons = async (req, res) => {
    try {
        const salons = await Salon.find({ 
            isRegistered: true,
            profileCompleted: true 
        }).select('-password -__v');

        res.json(salons);
    } catch (error) {
        console.error('Error fetching registered salons:', error);
        res.status(500).json({ 
            message: 'Error fetching salons', 
            error: error.message 
        });
    }
};

// Get salon by ID
exports.getSalonById = async (req, res) => {
    try {
        console.log('Getting salon with ID:', req.params.id);
        const salon = await Salon.findById(req.params.id).select('-password -__v');
        
        if (!salon) {
            return res.status(404).json({ message: 'Salon not found' });
        }
        
        res.json(salon);
    } catch (error) {
        console.error('Error fetching salon:', error);
        res.status(500).json({ message: 'Error fetching salon', error: error.message });
    }
};

// Update salon
exports.updateSalon = async (req, res) => {
    try {
        // Check if user is authorized to update this salon
        if (req.user.id !== req.params.id && req.user.userType !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this salon'
            });
        }

        const updatedSalon = await Salon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSalon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedSalon
        });
    } catch (error) {
        console.error('Error updating salon:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Complete salon registration
exports.completeSalonRegistration = async (req, res) => {
    try {
        // Extract all data from the request
        const { 
            phone, 
            location, 
            description,
            businessHours, 
            services
        } = req.body;

        // Validate required fields
        if (!phone || !location) {
            return res.status(400).json({
                success: false,
                message: 'Phone and location are required'
            });
        }

        // Ensure user is a salon
        if (req.user.userType !== 'salon') {
            return res.status(403).json({
                success: false,
                message: 'Only salon accounts can complete salon registration'
            });
        }

        // Update the salon with complete information
        const updatedSalon = await Salon.findByIdAndUpdate(
            req.user.id,
            {
                phone,
                location,
                description: description || '',
                businessHours: businessHours || {},
                services: services || [],
                isProfileComplete: true
            },
            { new: true, runValidators: true }
        );

        if (!updatedSalon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }

        // Return the updated salon data
        const salonData = updatedSalon.toObject();
        delete salonData.password;

        res.status(200).json({
            success: true,
            message: 'Salon registration completed successfully',
            data: salonData
        });
    } catch (error) {
        console.error('Error completing salon registration:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};