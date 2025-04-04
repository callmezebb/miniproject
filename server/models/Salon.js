const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required']
    },
    price: {
        type: Number,
        required: [true, 'Service price is required'],
        min: 0
    },
    duration: {
        type: Number,
        required: [true, 'Service duration is required'],
        min: 1
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const salonSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please enter salon name'] 
    },
    ownerName: { 
        type: String, 
        required: [true, 'Please enter owner name'] 
    },
    email: { 
        type: String, 
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: { 
        type: String, 
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    userType: { 
        type: String, 
        default: 'salon' 
    },
    phone: { 
        type: String,
        match: [/^\d{10}$/, 'Please add a valid phone number']
    },
    location: { 
        type: String
    },
    description: {
        type: String
    },
    businessHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    services: [serviceSchema],
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Update the updatedAt field before saving
salonSchema.pre('save', async function(next) {
    this.updatedAt = Date.now();
    next();
});

// Encrypt password using bcrypt (only if it's modified)
salonSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
salonSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Salon', salonSchema);