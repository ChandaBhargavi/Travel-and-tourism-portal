const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const couponController = require('../controllers/couponController');
const validate = require('../middleware/validate');

// POST /api/coupons/apply
router.post(
    '/apply',
    [
        body('code').trim().notEmpty().withMessage('Coupon code is required'),
        body('booking_amount').isFloat({ min: 0.01 }).withMessage('Valid booking amount is required'),
        validate
    ],
    couponController.applyCoupon
);

module.exports = router;
