const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if email already exists
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered. Please login or use a different email.'
            });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), email.toLowerCase().trim(), phone ? phone.trim() : null, password_hash, 'user']
        );

        return res.status(201).json({
            success: true,
            message: 'Registration successful! You can now log in.',
            userId: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user and issue JWT
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const [users] = await pool.query(
            'SELECT id, name, email, phone, password_hash, role FROM users WHERE email = ?',
            [email.toLowerCase().trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        // Compare password with hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Create JWT payload
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        const secret = process.env.JWT_SECRET || 'travelgo_super_secret_jwt_key_2026_antigravity';
        const token = jwt.sign(payload, secret, { expiresIn: '1d' });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found.'
            });
        }

        return res.status(200).json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe
};
