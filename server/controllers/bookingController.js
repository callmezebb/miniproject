const Booking = require('../models/Booking');

// Add this to your booking controller
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check if user is authorized to cancel the booking
        // Allow salon owner or the user who made the booking to cancel
        if (req.user.userType === 'salon' && booking.salonId.toString() !== req.user.id &&
            req.user.userType === 'user' && booking.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }
        
        // Update booking status to cancelled
        booking.status = 'cancelled';
        await booking.save();
        
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getSalonBookings = async (req, res) => {
    try {
        const { salonId } = req.params;
        
        // Check if user is authorized to view these bookings
        // Allow salon owners to view their own bookings or admins to view any bookings
        if (req.user.userType === 'salon' && req.user.id !== salonId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these bookings'
            });
        }
        
        // Find all bookings for this salon
        const bookings = await Booking.find({ salonId })
            .sort({ date: -1, time: -1 }); // Sort by date and time, newest first
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching salon bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Add this function to your bookingController.js file
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed'
            });
        }
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Check if user is authorized to update this booking
        if (req.user.userType === 'salon' && booking.salonId.toString() !== req.user.id &&
            req.user.userType === 'user' && booking.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking'
            });
        }
        
        booking.status = status;
        await booking.save();
        
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 