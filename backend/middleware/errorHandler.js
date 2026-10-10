/**
 * Global 404 handler for unknown API routes
 */
const notFoundHandler = (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: `API route not found: ${req.method} ${req.path}`
        });
    }
    next();
};

/**
 * Global centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled server error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
