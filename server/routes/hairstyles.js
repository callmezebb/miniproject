const express = require('express');
const router = express.Router();
const Hairstyle = require('../models/Hairstyle'); // Corrected path to the Hairstyle model
const { protect, authorize } = require('../middleware/auth');
const { upload, analyzeFace } = require('../controllers/hairstyleController');

// @route   POST /api/hairstyles
// @desc    Create a new hairstyle
// @access  Private (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        // Create hairstyle
        const hairstyle = await Hairstyle.create(req.body);
        
        res.status(201).json({
            success: true,
            data: hairstyle
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/hairstyles
// @desc    Get all hairstyles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const hairstyles = await Hairstyle.find(); // Fetch all hairstyles from the database
        res.json({
            success: true,
            count: hairstyles.length,
            data: hairstyles
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/hairstyles/:id
// @desc    Get hairstyle by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const hairstyle = await Hairstyle.findById(req.params.id);
        
        if (!hairstyle) {
            return res.status(404).json({ success: false, message: 'Hairstyle not found' });
        }
        
        res.json({
            success: true,
            data: hairstyle
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Hairstyle not found' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/hairstyles/:id
// @desc    Update hairstyle
// @access  Private (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        let hairstyle = await Hairstyle.findById(req.params.id);
        
        if (!hairstyle) {
            return res.status(404).json({ success: false, message: 'Hairstyle not found' });
        }
        
        // Update hairstyle
        hairstyle = await Hairstyle.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            data: hairstyle
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Hairstyle not found' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/hairstyles/:id
// @desc    Delete hairstyle
// @access  Private (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const hairstyle = await Hairstyle.findById(req.params.id);
        
        if (!hairstyle) {
            return res.status(404).json({ success: false, message: 'Hairstyle not found' });
        }
        
        await hairstyle.remove();
        
        res.json({ success: true, message: 'Hairstyle removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Hairstyle not found' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST route for face analysis

module.exports = router;
