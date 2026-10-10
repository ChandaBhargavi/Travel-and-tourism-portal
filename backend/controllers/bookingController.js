const pool = require('../config/db');

/**
 * Generate a unique payment transaction ID
 */
function generatePaymentId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `PAY_TG_${timestamp}_${randomStr}`;
}

/**
 * Create a new booking (Logged-in user)
 */
const createBooking = async (req, res, next) => {
    try {
        const { package_id, full_name, email, phone, num_people, travel_date, payment_method, card_number, card_expiry, card_cvv, upi_id, coupon_code } = req.body;
        const user_id = req.user.id;

        // Verify if user account exists in DB (protects against stale JWT tokens)
        const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [user_id]);
        let validUserId = user_id;
        if (users.length === 0) {
            // Check if user exists by email as fallback
            const [usersByEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
            if (usersByEmail.length > 0) {
                validUserId = usersByEmail[0].id;
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Your user account session is outdated or no longer exists. Please register or log in again.'
                });
            }
        }

        // Verify package exists and get price
        const [packages] = await pool.query('SELECT price, is_active FROM packages WHERE id = ?', [package_id]);
        if (packages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Selected package does not exist.'
            });
        }

        const selectedPackage = packages[0];
        if (!selectedPackage.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Selected package is currently inactive.'
            });
        }

        // Verify travel_date is in the future
        const inputDate = new Date(travel_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(inputDate.getTime()) || inputDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Travel date must be today or a future date.'
            });
        }

        const peopleCount = parseInt(num_people, 10);
        if (isNaN(peopleCount) || peopleCount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Number of people must be greater than zero.'
            });
        }

        // Base total price
        let base_price = parseFloat(selectedPackage.price) * peopleCount;
        let discount_amount = 0;
        let cleanCouponCode = null;

        // Verify coupon server-side if provided
        if (coupon_code && coupon_code.trim()) {
            cleanCouponCode = coupon_code.trim().toUpperCase();
            const [coupons] = await pool.query(
                'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE',
                [cleanCouponCode]
            );

            if (coupons.length > 0) {
                const coupon = coupons[0];
                const minAmount = parseFloat(coupon.min_booking_amount);
                if (base_price >= minAmount) {
                    if (coupon.discount_type === 'percentage') {
                        discount_amount = (base_price * parseFloat(coupon.discount_value)) / 100;
                    } else {
                        discount_amount = parseFloat(coupon.discount_value);
                    }
                    if (discount_amount > base_price) discount_amount = base_price;
                }
            }
        }

        discount_amount = parseFloat(discount_amount.toFixed(2));
        const total_price = (base_price - discount_amount).toFixed(2);

        let bookingStatus = 'pending';
        let paymentStatus = 'unpaid';
        let paymentId = null;
        let selectedPaymentMethod = null;
        let paidAt = null;

        // Check if online payment was requested at creation time
        if (payment_method && payment_method !== 'pay_later') {
            selectedPaymentMethod = payment_method;

            // Validate payment method inputs
            if (payment_method === 'Credit/Debit Card') {
                if (!card_number || card_number.replace(/\s/g, '').length < 15) {
                    return res.status(400).json({ success: false, message: 'Please enter a valid 16-digit Card Number.' });
                }
                if (!card_expiry || !/^\d{2}\/\d{2}$/.test(card_expiry)) {
                    return res.status(400).json({ success: false, message: 'Please enter a valid Expiry Date (MM/YY).' });
                }
                if (!card_cvv || !/^\d{3,4}$/.test(card_cvv)) {
                    return res.status(400).json({ success: false, message: 'Please enter a valid 3-digit CVV.' });
                }
            } else if (payment_method === 'UPI / GPay / PhonePe') {
                if (!upi_id || !upi_id.includes('@')) {
                    return res.status(400).json({ success: false, message: 'Please enter a valid UPI ID (e.g. name@upi).' });
                }
            }

            // Generate Payment Transaction ID
            paymentId = generatePaymentId();
            paymentStatus = 'paid';
            bookingStatus = 'confirmed';
            paidAt = new Date();
        }

        // Insert booking record with validated user ID
        const [result] = await pool.query(
            `INSERT INTO bookings 
             (user_id, package_id, full_name, email, phone, num_people, travel_date, total_price, coupon_code, discount_amount, status, payment_status, payment_method, payment_id, paid_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [validUserId, package_id, full_name.trim(), email.trim(), phone ? phone.trim() : null, peopleCount, travel_date, total_price, cleanCouponCode, discount_amount, bookingStatus, paymentStatus, selectedPaymentMethod, paymentId, paidAt]
        );

        return res.status(201).json({
            success: true,
            message: paymentStatus === 'paid' ? 'Payment processed successfully! Your booking is confirmed.' : 'Booking request submitted successfully!',
            bookingId: result.insertId,
            total_price,
            discount_amount,
            coupon_code: cleanCouponCode,
            status: bookingStatus,
            payment_status: paymentStatus,
            payment_id: paymentId,
            payment_method: selectedPaymentMethod,
            paid_at: paidAt
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Process Online Payment for an existing booking
 */
const processPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { payment_method, card_number, card_expiry, card_cvv, upi_id } = req.body;
        const user_id = req.user.id;

        // Check if booking belongs to user
        const [bookings] = await pool.query(
            'SELECT id, user_id, total_price, status, payment_status FROM bookings WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or access denied.'
            });
        }

        const booking = bookings[0];
        if (booking.payment_status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'This booking has already been paid.'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot process payment for a cancelled booking.'
            });
        }

        if (!payment_method) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required.'
            });
        }

        // Validate payment inputs based on selected method
        if (payment_method === 'Credit/Debit Card') {
            if (!card_number || card_number.replace(/\s/g, '').length < 15) {
                return res.status(400).json({ success: false, message: 'Please enter a valid 16-digit Card Number.' });
            }
            if (!card_expiry || !/^\d{2}\/\d{2}$/.test(card_expiry)) {
                return res.status(400).json({ success: false, message: 'Please enter a valid Expiry Date (MM/YY).' });
            }
            if (!card_cvv || !/^\d{3,4}$/.test(card_cvv)) {
                return res.status(400).json({ success: false, message: 'Please enter a valid 3-digit CVV.' });
            }
        } else if (payment_method === 'UPI / GPay / PhonePe') {
            if (!upi_id || !upi_id.includes('@')) {
                return res.status(400).json({ success: false, message: 'Please enter a valid UPI ID (e.g. user@bank).' });
            }
        }

        // Generate Payment Transaction ID
        const paymentId = generatePaymentId();
        const paidAt = new Date();

        // Update DB record to paid & auto-confirm booking
        await pool.query(
            `UPDATE bookings 
             SET payment_status = 'paid', payment_method = ?, payment_id = ?, paid_at = ?, status = 'confirmed' 
             WHERE id = ?`,
            [payment_method, paymentId, paidAt, id]
        );

        return res.status(200).json({
            success: true,
            message: 'Online payment processed successfully! Booking confirmed.',
            bookingId: parseInt(id, 10),
            total_price: booking.total_price,
            payment_status: 'paid',
            status: 'confirmed',
            payment_id: paymentId,
            payment_method,
            paid_at: paidAt
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user's bookings with payment details
 */
const getMyBookings = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const [bookings] = await pool.query(
            `SELECT b.*, p.title AS package_title, p.image_url AS package_image, p.duration_days, p.duration_nights, d.name AS destination_name 
             FROM bookings b 
             JOIN packages p ON b.package_id = p.id 
             JOIN destinations d ON p.destination_id = d.id 
             WHERE b.user_id = ? 
             ORDER BY b.created_at DESC`,
            [user_id]
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
 * Cancel user's own booking
 */
const cancelMyBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Check if booking belongs to user
        const [bookings] = await pool.query('SELECT id, status FROM bookings WHERE id = ? AND user_id = ?', [id, user_id]);
        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or access denied.'
            });
        }

        const booking = bookings[0];
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled.'
            });
        }

        // Update status to cancelled
        await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);

        return res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    processPayment,
    getMyBookings,
    cancelMyBooking
};
