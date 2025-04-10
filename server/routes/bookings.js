const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { cancelBooking, getSalonBookings, updateBookingStatus } = require('../controllers/bookingController');
const Booking = require('../models/Booking');

// Check appointment availability
router.post('/check-availability', protect, async (req, res) => {
    try {
        const { salonId, date, time } = req.body;

        // Check if there's any existing appointment at this time
        const existingAppointment = await Appointment.findOne({
            salonId,
            date,
            time,
            status: { $ne: 'cancelled' }
        });

        res.json({
            available: !existingAppointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking availability'
        });
    }
});

// Book appointment
router.post('/', protect, async (req, res) => {
    try {
        // Check if time slot is available
        const existingBooking = await Booking.findOne({
            salonId: req.body.salonId,
            date: req.body.date,
            time: req.body.time,
            status: { $ne: 'cancelled' } // Ignore cancelled bookings
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'This time slot is already booked' });
        }

        // Create new booking
        const booking = new Booking({
            userId: req.user.id,
            userName: req.body.userName || req.user.name,
            userEmail: req.body.userEmail || req.user.email,
            userPhone: req.body.userPhone,
            salonId: req.body.salonId,
            date: req.body.date,
            time: req.body.time,
            hairstyleRequest: req.body.hairstyleRequest,
            specialInstructions: req.body.specialInstructions,
            status: 'pending'
        });

        await booking.save();
        
        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
});

// Cancel booking route
router.patch('/cancel/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns this booking or is admin
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ success: true, data: booking });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
});

// Add this to your existing bookings routes
router.get('/salon/:salonId', protect, getSalonBookings);

// Add this route to your bookings.js file
router.put('/:id/status', protect, updateBookingStatus);

// Get available time slots
router.post('/available-slots', protect, async (req, res) => {
    try {
        const { salonId, date } = req.body;

        // Convert date string to Date object for proper comparison
        const bookingDate = new Date(date);
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find all bookings for this salon and date that aren't cancelled
        const bookedSlots = await Booking.find({
            salonId: salonId,
            date: {
                $gte: bookingDate,
                $lt: nextDay
            },
            status: { $ne: 'cancelled' }
        }).select('time');

        const bookedTimes = bookedSlots.map(booking => booking.time);
        const allSlots = generateTimeSlots();
        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

        res.json(availableSlots);
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Error fetching available slots', error: error.message });
    }
});

// Get user bookings
router.get('/user', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .sort({ date: -1, time: -1 })
            .populate('salonId', 'name location phone');

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

// Get salon bookings
router.get('/salon', protect, async (req, res) => {
    try {
        // Make sure the user is a salon owner
        if (req.user.userType !== 'salon') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const bookings = await Booking.find({ salonId: req.user.salonId })
            .sort({ date: 1, time: 1 })
            .populate('userId', 'name email');

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching salon bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

// Update booking status (confirm/cancel)
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization (user can only cancel their own bookings, salons can update any status)
        const isSalonOwner = req.user.userType === 'salon' && booking.salonId.toString() === req.user.salonId.toString();
        const isBookingUser = booking.userId.toString() === req.user.id;

        if (!isSalonOwner && (!isBookingUser || status !== 'cancelled')) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        booking.status = status;
        await booking.save();

        res.json(booking);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Error updating booking', error: error.message });
    }
});

// Get user's appointments
router.get('/user/:userId', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            .populate('salonId', 'name location phone')
            .sort({ date: 1, time: 1 });
        
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
});

function generateTimeSlots() {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
}

module.exports = router;