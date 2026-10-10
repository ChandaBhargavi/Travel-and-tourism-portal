const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const couponRoutes = require('./routes/coupons');
const adminRoutes = require('./routes/admin');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Register REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);

// Catch unknown API routes (404)
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Test database connection on server boot
async function startServer() {
    try {
        const [rows] = await pool.query('SELECT 1');
        if (rows && rows.length > 0) {
            console.log('MySQL connected successfully.');
        }
        
        app.listen(PORT, () => {
            console.log(`TravelGo Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed on server boot:', error.message);
        console.error('Please verify your MySQL service, credentials, and schema.');
        process.exit(1);
    }
}

startServer();
