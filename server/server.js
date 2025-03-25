const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../config.env') }); // Ensure correct path to .env file

// Check if environment variables are loaded
if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Update this to match your frontend URL
    credentials: true
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const salonRoutes = require('./routes/salons');
const bookingRoutes = require('./routes/bookings');
const hairstyleRoutes = require('./routes/hairstyles'); // Import hairstyles route

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hairstyles', hairstyleRoutes); // Mount hairstyles route

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error'
    });
});

// Connect to MongoDB with error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Start the server
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    process.exit(1);
});