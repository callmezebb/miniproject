const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
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
        enum: ['user', 'salon'],
        required: true
    },
    // Salon-specific fields
    phone: {
        type: String,
        match: [/^\d{10}$/, 'Please add a valid phone number'],
        required: function () {
            return this.userType === 'salon';
        }
    },
    location: {
        type: String,
        required: function () {
            return this.userType === 'salon';
        }
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, userType: this.userType },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Match user-entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);