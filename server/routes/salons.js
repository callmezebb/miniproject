const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { registerSalon, getSalonById, updateSalon, completeSalonRegistration, getRegisteredSalons } = require('../controllers/salonController');
const Salon = require('../models/Salon');

// Define routes
router.post('/register', protect, registerSalon);

// Get all registered salons (put this BEFORE the :id route!)
router.get('/registered', protect, async (req, res) => {
  try {
    console.log('Fetching registered salons...');
    const salons = await Salon.find({ 
      isProfileComplete: true 
    }).select('-password -__v');

    console.log(`Found ${salons.length} registered salons`);
    
    if (salons.length === 0) {
      console.log('No registered salons found');
      return res.status(404).json({ 
        message: 'No registered salons found' 
      });
    }

    res.json(salons);
  } catch (error) {
    console.error('Error fetching registered salons:', error);
    res.status(500).json({ 
      message: 'Error fetching salons', 
      error: error.message 
    });
  }
});

// Get salon by ID - this should come AFTER specific routes
router.get('/:id', protect, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id)
      .select('-password -__v')
      .lean();
    
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    
    // Add debug logging
    console.log('Fetched salon data:', salon);
    
    res.json({
      success: true,
      data: {
        name: salon.name,
        ownerName: salon.ownerName,
        email: salon.email,
        phone: salon.phone || '',
        location: salon.location || '',
        services: salon.services || [],
        isProfileComplete: salon.isProfileComplete
      }
    });
  } catch (error) {
    console.error('Error fetching salon:', error);
    res.status(500).json({ message: 'Error fetching salon', error: error.message });
  }
});

// Update salon profile - protected route
router.put('/:id', protect, updateSalon);

// Complete salon registration after initial signup
router.post('/complete-registration', protect, completeSalonRegistration);

// Get all registered salons
router.get('/all-registered', protect, getRegisteredSalons);

// Debug route - no auth required
router.get('/debug', async (req, res) => {
  try {
    const count = await Salon.countDocuments({ isRegistered: true });
    const sampleSalon = await Salon.findOne({ isRegistered: true }).select('name location');
    
    res.json({
      totalCount: await Salon.countDocuments(),
      registeredCount: count,
      sampleSalon: sampleSalon || 'None found',
      message: 'Debug info retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Debug error', error: error.message });
  }
});

module.exports = router;