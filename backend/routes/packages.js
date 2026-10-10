const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public routes
router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);
router.get('/:id/reviews', packageController.getPackageReviews);

// Protected routes (Logged-in user)
router.post(
    '/:id/reviews',
    verifyToken,
    [
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5 stars'),
        validate
    ],
    packageController.addPackageReview
);

module.exports = router;
