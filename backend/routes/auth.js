const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/auth/register
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').trim().isEmail().withMessage('Please provide a valid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        validate
    ],
    authController.register
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').trim().isEmail().withMessage('Please provide a valid email address'),
        body('password').notEmpty().withMessage('Password is required'),
        validate
    ],
    authController.login
);

// GET /api/auth/me
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
