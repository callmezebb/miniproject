const Salon = require('../models/Salon');

// Add a new service
exports.addService = async (req, res) => {
    try {
        const { salonId } = req.params;
        const { name, price, duration, description } = req.body;
        
        // Validate required fields
        if (!name || !price || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, price, and duration'
            });
        }
        
        // Find the salon
        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }
        
        // Add the new service
        salon.services.push({
            name,
            price,
            duration,
            description
        });
        
        await salon.save();
        
        res.status(201).json({
            success: true,
            data: salon.services[salon.services.length - 1]
        });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all services for a salon
exports.getServices = async (req, res) => {
    try {
        const { salonId } = req.params;
        
        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: salon.services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update a service
exports.updateService = async (req, res) => {
    try {
        const { salonId, serviceId } = req.params;
        const updateData = req.body;
        
        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }
        
        const service = salon.services.id(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        Object.assign(service, updateData);
        await salon.save();
        
        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete a service
exports.deleteService = async (req, res) => {
    try {
        const { salonId, serviceId } = req.params;
        
        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({
                success: false,
                message: 'Salon not found'
            });
        }
        
        salon.services.pull(serviceId);
        await salon.save();
        
        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}; 