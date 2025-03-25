const mongoose = require('mongoose');

const SalonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add salon name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    phone: {
        type: String,
        required: [true, 'Please add phone number'],
        match: [/^\d{10}$/, 'Please add a valid phone number']
    },
    location: {
        type: String,
        required: [true, 'Please add salon location']
    },
    workingHours: {
        days: [String],
        openTime: String,
        closeTime: String
    },
    services: [{
        name: String,
        price: Number,
        duration: Number
    }],
    userType: {
        type: String,
        default: 'salon'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Salon', SalonSchema);