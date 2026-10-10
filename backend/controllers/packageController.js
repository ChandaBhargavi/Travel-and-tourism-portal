const pool = require('../config/db');

/**
 * Get packages list with average ratings & review counts (optional query parameter ?destination_id=)
 */
const getAllPackages = async (req, res, next) => {
    try {
        const { destination_id } = req.query;
        let sql = `
            SELECT p.*, d.name AS destination_name,
                   COALESCE(AVG(r.rating), 5.0) AS avg_rating,
                   COUNT(r.id) AS review_count
            FROM packages p
            JOIN destinations d ON p.destination_id = d.id
            LEFT JOIN reviews r ON p.id = r.package_id
            WHERE p.is_active = TRUE
        `;
        const params = [];

        if (destination_id) {
            sql += ' AND p.destination_id = ?';
            params.push(destination_id);
        }

        sql += ' GROUP BY p.id ORDER BY p.id DESC';

        const [packages] = await pool.query(sql, params);
        
        // Format avg_rating to 1 decimal place
        const formattedPackages = packages.map(pkg => ({
            ...pkg,
            avg_rating: parseFloat(Number(pkg.avg_rating).toFixed(1)),
            review_count: parseInt(pkg.review_count, 10)
        }));

        return res.status(200).json({
            success: true,
            count: formattedPackages.length,
            packages: formattedPackages
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get package details by ID with rating summary
 */
const getPackageById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [packages] = await pool.query(
            `SELECT p.*, d.name AS destination_name,
                    COALESCE(AVG(r.rating), 5.0) AS avg_rating,
                    COUNT(r.id) AS review_count 
             FROM packages p 
             JOIN destinations d ON p.destination_id = d.id 
             LEFT JOIN reviews r ON p.id = r.package_id
             WHERE p.id = ?
             GROUP BY p.id`,
            [id]
        );

        if (packages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        const pkg = packages[0];
        pkg.avg_rating = parseFloat(Number(pkg.avg_rating).toFixed(1));
        pkg.review_count = parseInt(pkg.review_count, 10);

        return res.status(200).json({
            success: true,
            package: pkg
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get reviews for a package
 */
const getPackageReviews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [reviews] = await pool.query(
            'SELECT * FROM reviews WHERE package_id = ? ORDER BY created_at DESC',
            [id]
        );

        return res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a review for a package (Logged-in user)
 */
const addPackageReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const user_id = req.user.id;
        const user_name = req.user.name;

        const ratingVal = parseInt(rating, 10);
        if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5.'
            });
        }

        // Verify package exists
        const [packages] = await pool.query('SELECT id FROM packages WHERE id = ?', [id]);
        if (packages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Package not found.'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO reviews (user_id, package_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [user_id, id, user_name, ratingVal, comment ? comment.trim() : '']
        );

        return res.status(201).json({
            success: true,
            message: 'Thank you! Your review has been published.',
            reviewId: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPackages,
    getPackageById,
    getPackageReviews,
    addPackageReview
};
