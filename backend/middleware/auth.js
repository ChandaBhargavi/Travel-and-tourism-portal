const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'travelgo_super_secret_jwt_key_2026_antigravity');
        req.user = decoded; // Contains id, name, email, role
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

/**
 * Middleware to restrict access to admin users only
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden. Admin privileges required.'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    requireAdmin
};
