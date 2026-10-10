const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All booking routes require user authentication
router.use(verifyToken);

// POST /api/bookings
router.post(
    '/',
    [
        body('package_id').isInt({ min: 1 }).withMessage('Valid package ID is required'),
        body('full_name').trim().notEmpty().withMessage('Full name is required'),
        body('email').trim().isEmail().withMessage('Valid email address is required'),
        body('num_people').isInt({ min: 1 }).withMessage('Number of people must be at least 1'),
        body('travel_date').notEmpty().withMessage('Travel date is required'),
        validate
    ],
    bookingController.createBooking
);

// POST /api/bookings/:id/pay (Online Payment processing)
router.post(
    '/:id/pay',
    [
        body('payment_method').trim().notEmpty().withMessage('Payment method is required'),
        validate
    ],
    bookingController.processPayment
);

// GET /api/bookings/my
router.get('/my', bookingController.getMyBookings);

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', bookingController.cancelMyBooking);

module.exports = router;
