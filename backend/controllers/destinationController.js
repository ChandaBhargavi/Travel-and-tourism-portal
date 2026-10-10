const pool = require('../config/db');

/**
 * Get all destinations
 */
const getAllDestinations = async (req, res, next) => {
    try {
        const [destinations] = await pool.query('SELECT * FROM destinations ORDER BY name ASC');
        return res.status(200).json({
            success: true,
            count: destinations.length,
            destinations
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get destination by ID
 */
const getDestinationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [destinations] = await pool.query('SELECT * FROM destinations WHERE id = ?', [id]);

        if (destinations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Destination not found'
            });
        }

        return res.status(200).json({
            success: true,
            destination: destinations[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllDestinations,
    getDestinationById
};
