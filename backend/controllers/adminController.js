const pool = require('../config/db');

/**
 * Get dashboard statistics and analytics data for Chart.js rendering
 */
const getStats = async (req, res, next) => {
    try {
        const [[{ total_users }]] = await pool.query('SELECT COUNT(*) AS total_users FROM users');
        const [[{ total_bookings }]] = await pool.query('SELECT COUNT(*) AS total_bookings FROM bookings');
        const [[{ total_destinations }]] = await pool.query('SELECT COUNT(*) AS total_destinations FROM destinations');
        const [[{ total_revenue }]] = await pool.query(
            "SELECT COALESCE(SUM(total_price), 0) AS total_revenue FROM bookings WHERE payment_status = 'paid' OR status = 'confirmed'"
        );
        const [[{ total_paid_bookings }]] = await pool.query(
            "SELECT COUNT(*) AS total_paid_bookings FROM bookings WHERE payment_status = 'paid'"
        );

        // Payment Method breakdown for Doughnut Chart
        const [paymentMethods] = await pool.query(
            `SELECT COALESCE(payment_method, 'Pay Later') AS method, COUNT(*) AS count 
             FROM bookings 
             GROUP BY method`
        );

        // Top Booked Destinations for Pie Chart
        const [topDestinations] = await pool.query(
            `SELECT d.name AS destination_name, COUNT(b.id) AS booking_count 
             FROM bookings b 
             JOIN packages p ON b.package_id = p.id 
             JOIN destinations d ON p.destination_id = d.id 
             GROUP BY d.id 
             ORDER BY booking_count DESC LIMIT 5`
        );

        return res.status(200).json({
            success: true,
            stats: {
                total_users: parseInt(total_users, 10),
                total_bookings: parseInt(total_bookings, 10),
                total_destinations: parseInt(total_destinations, 10),
                total_paid_bookings: parseInt(total_paid_bookings, 10),
                total_revenue: parseFloat(total_revenue),
                payment_methods: paymentMethods,
                top_destinations: topDestinations
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all users list
 */
const getUsers = async (req, res, next) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY id DESC');
        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all bookings list with payment details
 */
const getBookings = async (req, res, next) => {
    try {
        const [bookings] = await pool.query(
            `SELECT b.*, p.title AS package_title, d.name AS destination_name, u.name AS user_name 
             FROM bookings b 
             JOIN packages p ON b.package_id = p.id 
             JOIN destinations d ON p.destination_id = d.id 
             LEFT JOIN users u ON b.user_id = u.id 
             ORDER BY b.created_at DESC`
        );
        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update booking status (pending, confirmed, cancelled)
 */
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value. Must be pending, confirmed, or cancelled.'
            });
        }

        const [result] = await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete booking
 */
const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Booking deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

// --- Destination CRUD ---

/**
 * Create destination
 */
const createDestination = async (req, res, next) => {
    try {
        const { name, description, image_url } = req.body;

        const [existing] = await pool.query('SELECT id FROM destinations WHERE name = ?', [name.trim()]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A destination with this name already exists.'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO destinations (name, description, image_url) VALUES (?, ?, ?)',
            [name.trim(), description ? description.trim() : '', image_url ? image_url.trim() : '']
        );

        return res.status(201).json({
            success: true,
            message: 'Destination created successfully',
            destinationId: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update destination
 */
const updateDestination = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, image_url } = req.body;

        const [result] = await pool.query(
            'UPDATE destinations SET name = ?, description = ?, image_url = ? WHERE id = ?',
            [name.trim(), description ? description.trim() : '', image_url ? image_url.trim() : '', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Destination not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Destination updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete destination
 */
const deleteDestination = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM destinations WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Destination not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Destination deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// --- Package CRUD ---

/**
 * Create tour package
 */
const createPackage = async (req, res, next) => {
    try {
        const { destination_id, title, description, duration_days, duration_nights, price, image_url, is_active } = req.body;

        const [result] = await pool.query(
            `INSERT INTO packages 
             (destination_id, title, description, duration_days, duration_nights, price, image_url, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                destination_id,
                title.trim(),
                description ? description.trim() : '',
                parseInt(duration_days, 10) || 1,
                parseInt(duration_nights, 10) || 0,
                parseFloat(price),
                image_url ? image_url.trim() : '',
                is_active !== undefined ? Boolean(is_active) : true
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Tour package created successfully',
            packageId: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update tour package
 */
const updatePackage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { destination_id, title, description, duration_days, duration_nights, price, image_url, is_active } = req.body;

        const [result] = await pool.query(
            `UPDATE packages 
             SET destination_id = ?, title = ?, description = ?, duration_days = ?, duration_nights = ?, price = ?, image_url = ?, is_active = ? 
             WHERE id = ?`,
            [
                destination_id,
                title.trim(),
                description ? description.trim() : '',
                parseInt(duration_days, 10) || 1,
                parseInt(duration_nights, 10) || 0,
                parseFloat(price),
                image_url ? image_url.trim() : '',
                is_active !== undefined ? Boolean(is_active) : true,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Package not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tour package updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete tour package
 */
const deletePackage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM packages WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Package not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tour package deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStats,
    getUsers,
    getBookings,
    updateBookingStatus,
    deleteBooking,
    createDestination,
    updateDestination,
    deleteDestination,
    createPackage,
    updatePackage,
    deletePackage
};
