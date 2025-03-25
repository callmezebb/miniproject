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