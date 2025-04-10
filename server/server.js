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
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Added PATCH and OPTIONS to allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Add options handling before other routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Import routes
const authRoutes = require('./routes/auth');
const salonRoutes = require('./routes/salons');
const bookingRoutes = require('./routes/bookings');
const hairstyleRoutes = require('./routes/hairstyles');
const serviceRoutes = require('./routes/services');
const faceAnalysisRoutes = require('./routes/faceAnalysis');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hairstyles', hairstyleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/face', faceAnalysisRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Connect to MongoDB with improved error handling and options
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            heartbeatFrequencyMS: 10000, // Heartbeat frequency
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Add event listeners for connection issues
        mongoose.connection.on('error', err => {
            console.error(`MongoDB connection error: ${err}`);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
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
    // Allow the process to continue running despite unhandled rejections in production
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});