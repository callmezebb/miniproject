const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    addService,
    updateService,
    deleteService,
    getServices
} = require('../controllers/serviceController');

router.post('/:salonId/services', protect, addService);
router.get('/:salonId/services', getServices);
router.put('/:salonId/services/:serviceId', protect, updateService);
router.delete('/:salonId/services/:serviceId', protect, deleteService);

module.exports = router; 