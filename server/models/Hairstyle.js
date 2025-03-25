const mongoose = require('mongoose');

const HairstyleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a hairstyle name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    faceShapes: {
        type: [String],
        enum: ['oval', 'round', 'square', 'all'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Hairstyle', HairstyleSchema);
