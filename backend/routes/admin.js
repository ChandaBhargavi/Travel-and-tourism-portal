const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All admin endpoints require authentication and admin role
router.use(verifyToken, requireAdmin);

// Dashboard statistics
router.get('/stats', adminController.getStats);

// Users management
router.get('/users', adminController.getUsers);

// Bookings management
router.get('/bookings', adminController.getBookings);
router.patch(
    '/bookings/:id/status',
    [
        body('status').isIn(['pending', 'confirmed', 'cancelled']).withMessage('Invalid booking status'),
        validate
    ],
    adminController.updateBookingStatus
);
router.delete('/bookings/:id', adminController.deleteBooking);

// Destinations CRUD
router.post(
    '/destinations',
    [
        body('name').trim().notEmpty().withMessage('Destination name is required'),
        validate
    ],
    adminController.createDestination
);
router.put(
    '/destinations/:id',
    [
        body('name').trim().notEmpty().withMessage('Destination name is required'),
        validate
    ],
    adminController.updateDestination
);
router.delete('/destinations/:id', adminController.deleteDestination);

// Packages CRUD
router.post(
    '/packages',
    [
        body('destination_id').isInt({ min: 1 }).withMessage('Valid destination ID is required'),
        body('title').trim().notEmpty().withMessage('Package title is required'),
        body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
        validate
    ],
    adminController.createPackage
);
router.put(
    '/packages/:id',
    [
        body('destination_id').isInt({ min: 1 }).withMessage('Valid destination ID is required'),
        body('title').trim().notEmpty().withMessage('Package title is required'),
        body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
        validate
    ],
    adminController.updatePackage
);
router.delete('/packages/:id', adminController.deletePackage);

module.exports = router;
