const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

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
        const { salonId, serviceId, date, time, userId } = req.body;

        // Check availability again before booking
        const existingAppointment = await Appointment.findOne({
            salonId,
            date,
            time,
            status: { $ne: 'cancelled' }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is no longer available'
            });
        }

        const appointment = await Appointment.create({
            salonId,
            serviceId,
            userId,
            date,
            time,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error booking appointment'
        });
    }
});

module.exports = router;